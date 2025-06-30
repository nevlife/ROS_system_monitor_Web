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

        if (sortedTopics.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");
            cell.colSpan = 5;
            cell.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #95a5a6;">
                    <div style="font-size: 3rem; margin-bottom: 10px;">📡</div>
                    <div style="font-style: italic;">토픽 데이터를 기다리는 중...</div>
                </div>
            `;
            row.appendChild(cell);
            this.tbody.appendChild(row);
            return;
        }

        sortedTopics.forEach((topicName) => {
            const data = this.topicData.get(topicName) || this.inactiveTopics.get(topicName);
            const isActive = this.topicData.has(topicName);

            const row = document.createElement("tr");

            // 토픽 이름
            const nameCell = document.createElement("td");
            nameCell.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 1.2rem;">${isActive ? '🟢' : '🔴'}</span>
                    <span style="${!isActive ? 'color: #95a5a6; font-style: italic;' : 'font-weight: 500;'}">${topicName}</span>
                </div>
            `;
            row.appendChild(nameCell);

            if (isActive) {
                // Target Hz
                const targetCell = document.createElement("td");
                const targetHz = data.hzTarget;
                targetCell.innerHTML = `
                    <span style="font-weight: 600; color: #34495e;">
                        ${targetHz === -1 || targetHz < 0 ? 'None' : targetHz.toFixed(2) + ' Hz'}
                    </span>
                `;
                row.appendChild(targetCell);

                // Current Hz
                const hzCell = document.createElement("td");
                const hzValue = data.hz.toFixed(2);
                let hzColor = '#27ae60';
                let hzIcon = '✅';
                
                if (data.hzErrorLevel >= 2) {
                    hzColor = '#e74c3c';
                    hzIcon = '❌';
                    hzCell.className = "error-cell";
                } else if (data.hzErrorLevel >= 1) {
                    hzColor = '#f39c12';
                    hzIcon = '⚠️';
                    hzCell.className = "warning-cell";
                }

                hzCell.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <span>${hzIcon}</span>
                        <span style="font-weight: 600; color: ${hzColor};">${hzValue} Hz</span>
                    </div>
                `;
                row.appendChild(hzCell);

                // Bandwidth
                const bwCell = document.createElement("td");
                const bwFormatted = this.formatBandwidth(data.bw);
                bwCell.innerHTML = `
                    <span style="font-weight: 500; color: #7f8c8d;">
                        📊 ${bwFormatted}
                    </span>
                `;
                row.appendChild(bwCell);

                // Status
                const statusCell = document.createElement("td");
                let statusText = 'Good';
                let statusColor = '#27ae60';
                let statusIcon = '✅';

                if (data.hzErrorLevel >= 2) {
                    statusText = 'Critical';
                    statusColor = '#e74c3c';
                    statusIcon = '🚨';
                } else if (data.hzErrorLevel >= 1) {
                    statusText = 'Warning';
                    statusColor = '#f39c12';
                    statusIcon = '⚠️';
                }

                statusCell.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <span>${statusIcon}</span>
                        <span style="font-weight: 600; color: ${statusColor};">${statusText}</span>
                    </div>
                `;
                row.appendChild(statusCell);

            } else {
                // 비활성 토픽은 회색으로 표시
                for (let i = 0; i < 4; i++) {
                    const emptyCell = document.createElement("td");
                    emptyCell.innerHTML = `<span style="color: #bdc3c7;">-</span>`;
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
