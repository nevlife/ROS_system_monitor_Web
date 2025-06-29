// 전역 변수
let ros = null;
let systemMonitor = null;
let topicMonitor = null;
let nodeMonitor = null;
let gpuMonitor = null;
let logManager = null;
let rosbagRecorder = null;
let isConnected = false;

// 애플리케이션 초기화
document.addEventListener("DOMContentLoaded", function () {
    // 로그 매니저 초기화
    logManager = new LogManager();
    logManager.log("ROS Monitor 웹 인터페이스가 시작되었습니다.");

    // 모니터링 컴포넌트들 초기화
    systemMonitor = new SystemMonitor();
    topicMonitor = new TopicMonitor();
    nodeMonitor = new NodeMonitor();
    gpuMonitor = new GpuMonitor();
    rosbagRecorder = new RosbagRecorder();

    // 연결 버튼 이벤트
    document.getElementById("connect-button").addEventListener("click", connectToRos);

    // 연결 상태 표시 업데이트
    updateConnectionStatus(false, "연결 대기");

    logManager.log("모든 컴포넌트가 초기화되었습니다.");
});

// ROS 연결 함수
function connectToRos() {
    let url = document.getElementById("ros-url").value || "ws://localhost:9090";

    logManager.log(`원본 URL: "${url}"`);

    // URL 정리
    url = url.trim();
    logManager.log(`trim 후: "${url}"`);

    // 이미 올바른 WebSocket URL인지 먼저 확인
    if (url.startsWith("ws://") || url.startsWith("wss://")) {
        logManager.log("이미 올바른 WebSocket URL입니다");
    }
    // ngrok HTTPS URL을 WSS로 변환
    else if (url.startsWith("https://") && url.includes("ngrok.io")) {
        logManager.log("ngrok HTTPS URL 감지됨");
        url = url.replace("https://", "wss://");
        logManager.log(`ngrok HTTPS URL을 WSS로 변환: ${url}`);
    }
    // 일반 HTTP URL을 WS로 변환
    else if (url.startsWith("http://")) {
        logManager.log("일반 HTTP URL 감지됨");
        url = url.replace("http://", "ws://");
        logManager.log(`HTTP URL을 WS로 변환: ${url}`);
    }
    // 프로토콜이 없는 경우 ws:// 추가
    else {
        logManager.log("프로토콜 없는 URL 감지됨");
        url = "ws://" + url;
        logManager.log(`프로토콜 추가: ${url}`);
    }

    logManager.log(`최종 URL: "${url}"`);

    // URL 형식 검사
    try {
        new URL(url);
        logManager.log("URL 형식 검사 통과");
    } catch (e) {
        logManager.log(`잘못된 URL 형식: ${url} - ${e.message}`, "error");
        updateConnectionStatus(false, "URL 형식 오류");
        return;
    }

    logManager.log(`ROS Bridge에 연결 시도: ${url}`);
    updateConnectionStatus(false, "연결 중...");

    ros = new ROSLIB.Ros({
        url: url,
    });

    ros.on("connection", function () {
        isConnected = true;
        updateConnectionStatus(true, "연결됨");
        logManager.log("ROS Bridge에 성공적으로 연결되었습니다.", "info");

        // 구독자들 설정
        setupSubscribers();

        // 연결 버튼을 Disconnect로 변경
        const connectBtn = document.getElementById("connect-button");
        connectBtn.disabled = false;
        connectBtn.textContent = "Disconnect";
        connectBtn.onclick = disconnectFromRos;
    });

    ros.on("error", function (error) {
        isConnected = false;
        updateConnectionStatus(false, "연결 오류");

        // 더 자세한 에러 정보 로깅
        console.error("ROS 연결 에러:", error);
        console.error("에러 타입:", typeof error);
        console.error("에러 내용:", JSON.stringify(error, null, 2));

        logManager.log(`연결 오류 상세: ${JSON.stringify(error)}`, "error");

        // 연결 버튼을 다시 Connect로 변경
        const connectBtn = document.getElementById("connect-button");
        connectBtn.disabled = false;
        connectBtn.textContent = "Connect";
        connectBtn.onclick = connectToRos;
    });

    ros.on("close", function () {
        isConnected = false;
        updateConnectionStatus(false, "연결 끊김");
        logManager.log("ROS Bridge 연결이 끊어졌습니다.", "warning");

        // 연결 버튼을 다시 Connect로 변경
        const connectBtn = document.getElementById("connect-button");
        connectBtn.disabled = false;
        connectBtn.textContent = "Reconnect";
        connectBtn.onclick = connectToRos;
    });
}

// ROS 연결 해제 함수
function disconnectFromRos() {
    if (ros && isConnected) {
        logManager.log("ROS Bridge 연결을 해제합니다.");
        ros.close();

        // 연결 버튼을 다시 Connect로 변경
        const connectBtn = document.getElementById("connect-button");
        connectBtn.textContent = "Connect";
        connectBtn.onclick = connectToRos;

        updateConnectionStatus(false, "연결 해제됨");
    }
}

// 구독자 설정
function setupSubscribers() {
    // 시스템 상태 구독
    const systemStatusSub = new ROSLIB.Topic({
        ros: ros,
        name: "/system_status",
        messageType: "ros_monitor/SystemStatus",
    });

    systemStatusSub.subscribe(function (message) {
        systemMonitor.updateSystemStatus(message);
    });

    // 토픽 상태 구독
    const topicStatusSub = new ROSLIB.Topic({
        ros: ros,
        name: "/topic_hzbw",
        messageType: "ros_monitor/TopicStatusArray",
    });

    topicStatusSub.subscribe(function (message) {
        topicMonitor.updateTopicStatus(message);
    });

    // 노드 상태 구독
    const nodeStatusSub = new ROSLIB.Topic({
        ros: ros,
        name: "/nodes_status",
        messageType: "ros_monitor/NodeStatusArray",
    });

    nodeStatusSub.subscribe(function (message) {
        nodeMonitor.updateNodeStatus(message);
    });

    // GPU 프로세스 구독
    const gpuProcSub = new ROSLIB.Topic({
        ros: ros,
        name: "/gpu_proc_collector",
        messageType: "ros_monitor/GpuProcessArray",
    });

    gpuProcSub.subscribe(function (message) {
        gpuMonitor.updateGpuProcesses(message);
    });

    logManager.log("모든 ROS 토픽 구독이 설정되었습니다.");
}

// 연결 상태 업데이트
function updateConnectionStatus(connected, statusText) {
    const indicator = document.getElementById("status-indicator");
    const text = document.getElementById("status-text");

    if (connected) {
        indicator.className = "status-indicator connected";
    } else {
        indicator.className = "status-indicator disconnected";
    }

    text.textContent = statusText;
}

// ROS 객체를 다른 모듈에서 사용할 수 있도록 전역으로 노출
window.getRos = function () {
    return ros;
};

window.getLogManager = function () {
    return logManager;
};

window.isRosConnected = function () {
    return isConnected;
};
