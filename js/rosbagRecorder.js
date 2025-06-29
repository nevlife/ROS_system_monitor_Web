class RosbagRecorder {
    constructor() {
        this.recording = false;
        this.startTime = null;
        this.timerInterval = null;
        this.topics = [];

        this.recordButton = document.getElementById("record-button");
        this.editButton = document.getElementById("edit-topics-button");
        this.recordingIndicator = document.getElementById("recording-indicator");
        this.recordingTime = document.getElementById("recording-time");
        this.modal = document.getElementById("topic-modal");
        this.topicsTextarea = document.getElementById("topics-textarea");

        this.setupEventListeners();
        this.loadDefaultTopics();
    }

    setupEventListeners() {
        this.recordButton.addEventListener("click", () => this.toggleRecording());
        this.editButton.addEventListener("click", () => this.openTopicEditor());

        // 모달 이벤트
        document.getElementById("close-modal").addEventListener("click", () => this.closeModal());
        document.getElementById("save-topics").addEventListener("click", () => this.saveTopics());
        document.getElementById("cancel-topics").addEventListener("click", () => this.closeModal());

        // 모달 외부 클릭으로 닫기
        this.modal.addEventListener("click", (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
    }

    loadDefaultTopics() {
        // 기본 토픽 목록 (원본 코드의 yaml 파일 대신)
        this.topics = [
            "/cmd_vel",
            "/odom",
            "/scan",
            "/tf",
            "/tf_static",
            "/joint_states",
            "/camera/image_raw",
            "/imu/data",
            "/diagnostics",
        ];
    }

    toggleRecording() {
        if (this.recording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    }

    startRecording() {
        if (!window.isRosConnected()) {
            window.getLogManager()?.error("ROS에 연결되지 않았습니다. 먼저 연결하세요.");
            return;
        }

        if (this.topics.length === 0) {
            window.getLogManager()?.warning("녹화할 토픽이 없습니다.");
            return;
        }

        this.recording = true;
        this.startTime = new Date();

        // UI 업데이트
        this.recordingIndicator.classList.add("recording");
        this.recordButton.textContent = "Stop Record";
        this.recordButton.style.backgroundColor = "#e74c3c";
        this.editButton.disabled = true;

        // 타이머 시작
        this.timerInterval = setInterval(() => this.updateRecordingTime(), 1000);

        // 로그
        const timestamp = this.startTime.toISOString().replace(/[:.]/g, "-").slice(0, -5);
        const filename = `${timestamp}.bag`;

        window.getLogManager()?.info(`Rosbag 녹화 시작: ${filename}`);
        window.getLogManager()?.info(`녹화 토픽: ${this.topics.join(", ")}`);

        // 실제 rosbag 녹화는 웹에서 직접 불가능하므로 시뮬레이션
        // 실제 구현에서는 ROS 서비스를 통해 서버에서 녹화를 시작해야 함
        this.simulateRecording();
    }

    stopRecording() {
        this.recording = false;
        this.startTime = null;

        // UI 업데이트
        this.recordingIndicator.classList.remove("recording");
        this.recordButton.textContent = "Start Record";
        this.recordButton.style.backgroundColor = "";
        this.editButton.disabled = false;
        this.recordingTime.textContent = "00:00:00";

        // 타이머 중지
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        window.getLogManager()?.info("Rosbag 녹화가 중지되었습니다.");
    }

    updateRecordingTime() {
        if (this.startTime) {
            const elapsed = new Date() - this.startTime;
            const hours = Math.floor(elapsed / 3600000);
            const minutes = Math.floor((elapsed % 3600000) / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);

            this.recordingTime.textContent = `${hours.toString().padStart(2, "0")}:${minutes
                .toString()
                .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
        }
    }

    simulateRecording() {
        // 웹에서는 실제 rosbag 녹화가 불가능하므로 시뮬레이션
        // 실제 구현에서는 ROS 서비스 호출이 필요
        const ros = window.getRos();
        if (ros) {
            // 예시: rosbag 서비스 호출 (실제 서비스가 있다면)
            /*
            const rosbagService = new ROSLIB.Service({
                ros: ros,
                name: '/rosbag_record',
                serviceType: 'rosbag_recorder/StartRecord'
            });
            
            const request = new ROSLIB.ServiceRequest({
                topics: this.topics,
                filename: filename
            });
            
            rosbagService.callService(request, (result) => {
                if (result.success) {
                    window.getLogManager()?.info('Rosbag 녹화 서비스가 시작되었습니다.');
                } else {
                    window.getLogManager()?.error('Rosbag 녹화 시작 실패: ' + result.message);
                    this.stopRecording();
                }
            });
            */
        }
    }

    openTopicEditor() {
        if (this.recording) {
            window.getLogManager()?.warning("녹화 중에는 토픽을 편집할 수 없습니다.");
            return;
        }

        this.topicsTextarea.value = this.topics.join("\n");
        this.modal.style.display = "block";
    }

    closeModal() {
        this.modal.style.display = "none";
    }

    saveTopics() {
        const text = this.topicsTextarea.value.trim();
        const newTopics = text
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0 && !line.startsWith("#"));

        this.topics = newTopics;
        this.closeModal();

        window.getLogManager()?.info(`토픽 목록이 업데이트되었습니다. (${this.topics.length}개 토픽)`);
    }
}
