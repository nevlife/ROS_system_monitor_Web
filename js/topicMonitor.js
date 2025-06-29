class TopicMonitor {
    constructor() {
        this.tbody = document.getElementById("topics-tbody");
        this.topicData = new Map();
        this.inactiveTopics = new Map();
    }

    updateTopicStatus(message) {
        const currentTopics = new Set();

        // 활성 토픽 처리
        message.topic.forEach((topicStatus) => {
            const topicName = topicStatus.key;
            currentTopics.add(topicName);

            // 비활성 상태에서 활성화된 토픽 처리
            if (this.inactiveTopics.has(topicName)) {
                this.inactiveTopics.delete(topicName);
            }

            this.topicData.set(topicName, {
                hz: topicStatus.hz,
                hzTarget: topicStatus.hzTarget,
                hzErrorLevel: topicStatus.hzErrorLevel,
                bw: topicStatus.bw,
                active: true,
            });

            // 에러 레벨에 따른 로깅
            if (topicStatus.hzErrorLevel >= 2) {
                window
                    .getLogManager()
                    ?.error(`Topic ${topicName}: frequency too low - ${topicStatus.hz.toFixed(2)} Hz`);
            } else if (topicStatus.hzErrorLevel >= 1) {
                window
                    .getLogManager()
                    ?.warning(`Topic ${topicName}: frequency below target - ${topicStatus.hz.toFixed(2)} Hz`);
            }
        });

        // 비활성화된 토픽 처리
        this.topicData.forEach((data, topicName) => {
            if (!currentTopics.has(topicName)) {
                this.inactiveTopics.set(topicName, data);
                this.topicData.delete(topicName);
            }
        });

        this.updateTable();
    }

    updateTable() {
        // 테이블 초기화
        this.tbody.innerHTML = "";

        // 모든 토픽 (활성 + 비활성) 정렬
        const allTopics = new Map([...this.topicData, ...this.inactiveTopics]);
        const sortedTopics = Array.from(allTopics.keys()).sort();

        sortedTopics.forEach((topicName) => {
            const data = this.topicData.get(topicName) || this.inactiveTopics.get(topicName);
            const isActive = this.topicData.has(topicName);

            const row = document.createElement("tr");

            // 토픽 이름
            const nameCell = document.createElement("td");
            nameCell.textContent = topicName;
            if (!isActive) {
                nameCell.className = "inactive-topic";
            }
            row.appendChild(nameCell);

            if (isActive) {
                // Target Hz
                const targetCell = document.createElement("td");
                const targetHz = data.hzTarget;
                targetCell.textContent = targetHz === -1 || targetHz < 0 ? "None" : targetHz.toFixed(2);
                row.appendChild(targetCell);

                // Hz
                const hzCell = document.createElement("td");
                hzCell.textContent = data.hz.toFixed(2);
                if (data.hzErrorLevel >= 2) {
                    hzCell.className = "error-cell";
                } else if (data.hzErrorLevel >= 1) {
                    hzCell.className = "warning-cell";
                }
                row.appendChild(hzCell);

                // Bandwidth
                const bwCell = document.createElement("td");
                bwCell.textContent = this.formatBandwidth(data.bw);
                row.appendChild(bwCell);
            } else {
                // 비활성 토픽은 빈 셀
                for (let i = 0; i < 3; i++) {
                    const emptyCell = document.createElement("td");
                    emptyCell.textContent = "";
                    row.appendChild(emptyCell);
                }
            }

            this.tbody.appendChild(row);
        });
    }

    formatBandwidth(bw) {
        if (bw < 1024) {
            return `${bw.toFixed(2)} B/s`;
        } else if (bw < 1024 * 1024) {
            return `${(bw / 1024).toFixed(2)} KB/s`;
        } else {
            return `${(bw / (1024 * 1024)).toFixed(2)} MB/s`;
        }
    }
}
