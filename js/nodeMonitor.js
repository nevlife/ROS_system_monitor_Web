class NodeMonitor {
    constructor() {
        this.tbody = document.getElementById("nodes-tbody");
        this.titleElement = document.getElementById("nodes-monitor-title");
        this.nodeData = new Map();
        this.totalCores = 0;
        this.coresInitialized = false;
    }

    updateNodeStatus(message) {
        this.nodeData.clear();

        // 코어 개수를 한 번만 초기화
        if (!this.coresInitialized && message.node.length > 0 && message.node[0].logicalCores) {
            this.totalCores = message.node[0].logicalCores;
            this.updateTitle();
            this.coresInitialized = true;
        }

        message.node.forEach((nodeStatus) => {
            const nodeName = nodeStatus.key;
            const cpuUsage = nodeStatus.pCpu;
            const memUsage = nodeStatus.Ram / (1024 * 1024); // bytes to MB

            this.nodeData.set(nodeName, {
                cpu: cpuUsage,
                cpuTarget: nodeStatus.CpuTarget,
                cpuErrorLevel: nodeStatus.CpuErrorLevel,
                mem: memUsage,
                ramTarget: nodeStatus.RamTarget,
                ramErrorLevel: nodeStatus.RamErrorLevel,
                logicalCores: nodeStatus.logicalCores,
            });

            // ErrorLevel 기반 로깅
            if (nodeStatus.CpuErrorLevel >= 2) {
                window.getLogManager()?.error(`Node ${nodeName}: CPU critical - ${cpuUsage.toFixed(2)}%`);
            } else if (nodeStatus.CpuErrorLevel >= 1) {
                window.getLogManager()?.warning(`Node ${nodeName}: CPU warning - ${cpuUsage.toFixed(2)}%`);
            }

            if (nodeStatus.RamErrorLevel >= 2) {
                window.getLogManager()?.error(`Node ${nodeName}: RAM critical - ${memUsage.toFixed(2)} MB`);
            } else if (nodeStatus.RamErrorLevel >= 1) {
                window.getLogManager()?.warning(`Node ${nodeName}: RAM warning - ${memUsage.toFixed(2)} MB`);
            }
        });

        this.updateTable();
    }

    updateTitle() {
        if (this.titleElement && this.totalCores > 0) {
            this.titleElement.innerHTML = `ROS Nodes Monitor <span style="font-size: 0.9rem; color: #7f8c8d; font-weight: normal;">(${this.totalCores} cores)</span>`;
        }
    }

    updateTable() {
        this.tbody.innerHTML = "";

        if (this.nodeData.size === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");
            cell.colSpan = 4;
            cell.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #95a5a6;">
                    <div style="font-style: italic;">Waiting for node data...</div>
                </div>
            `;
            row.appendChild(cell);
            this.tbody.appendChild(row);
            return;
        }

        const sortedNodes = Array.from(this.nodeData.keys()).sort();

        sortedNodes.forEach((nodeName) => {
            const data = this.nodeData.get(nodeName);
            const row = document.createElement("tr");

            // 노드 이름
            const nameCell = document.createElement("td");

            // 전체 ErrorLevel 중 가장 심각한 상태 확인
            const overallErrorLevel = Math.max(data.cpuErrorLevel || 0, data.ramErrorLevel || 0);

            let nodeStatusColor = "#27ae60"; // 정상 (ErrorLevel 0)
            if (overallErrorLevel === 2) {
                nodeStatusColor = "#e74c3c"; // 심각한 오류
            } else if (overallErrorLevel === 1) {
                nodeStatusColor = "#f39c12"; // 경고
            }

            nameCell.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${nodeStatusColor};"></div>
                    <span style="font-weight: 500;">${nodeName}</span>
                </div>
            `;
            row.appendChild(nameCell);

            // CPU 사용률
            const cpuCell = document.createElement("td");
            const cpuValue = data.cpu.toFixed(2);
            let cpuColor = "#27ae60"; // 정상 (ErrorLevel 0)
            let cpuClass = "";

            if (data.cpuErrorLevel === 2) {
                cpuColor = "#e74c3c"; // 심각한 오류
                cpuClass = "error-cell";
            } else if (data.cpuErrorLevel === 1) {
                cpuColor = "#f39c12"; // 경고
                cpuClass = "warning-cell";
            }

            cpuCell.className = cpuClass;
            cpuCell.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="flex: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-weight: 600; color: ${cpuColor};">${cpuValue}%</span>
                        </div>
                        <div style="background: #ecf0f1; border-radius: 10px; height: 6px; margin-top: 4px; overflow: hidden;">
                            <div style="background: ${cpuColor}; height: 100%; width: ${Math.min(
                data.cpu,
                100
            )}%; transition: width 0.3s ease;"></div>
                        </div>
                    </div>
                </div>
            `;
            row.appendChild(cpuCell);

            // 메모리 사용량
            const memCell = document.createElement("td");
            const memValue = data.mem.toFixed(2);

            let memColor = "#34495e"; // 기본 색상
            if (data.ramErrorLevel === 2) {
                memColor = "#e74c3c"; // 심각한 오류
            } else if (data.ramErrorLevel === 1) {
                memColor = "#f39c12"; // 경고
            }

            memCell.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div>
                        <div style="font-weight: 600; color: ${memColor};">${memValue} MB</div>
                    </div>
                </div>
            `;
            row.appendChild(memCell);

            // Status
            const statusCell = document.createElement("td");
            let statusText = "Good";
            let finalStatusColor = "#27ae60";

            // CPU와 RAM ErrorLevel 중 더 심각한 상태 적용
            const maxErrorLevel = Math.max(data.cpuErrorLevel || 0, data.ramErrorLevel || 0);

            if (maxErrorLevel === 2) {
                statusText = "Critical";
                finalStatusColor = "#e74c3c";
            } else if (maxErrorLevel === 1) {
                statusText = "Warning";
                finalStatusColor = "#f39c12";
            }

            statusCell.innerHTML = `
                <span style="font-weight: 600; color: ${finalStatusColor};">${statusText}</span>
            `;
            row.appendChild(statusCell);

            this.tbody.appendChild(row);
        });
    }

    formatMemorySize(memMB) {
        if (memMB < 1) {
            return `${(memMB * 1024).toFixed(0)} KB`;
        } else if (memMB < 1024) {
            return `${memMB.toFixed(1)} MB`;
        } else {
            return `${(memMB / 1024).toFixed(2)} GB`;
        }
    }

    reset() {
        this.nodeData.clear();
        this.coresInitialized = false;
        this.totalCores = 0;

        // 제목도 초기화
        if (this.titleElement) {
            this.titleElement.innerHTML = "ROS Nodes Monitor";
        }

        this.tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: #95a5a6; font-style: italic; padding: 40px;">
                    Please connect to ROS to check node information
                </td>
            </tr>
        `;
    }
}
