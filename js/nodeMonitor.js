class NodeMonitor {
    constructor() {
        this.tbody = document.getElementById("nodes-tbody");
        this.nodeData = new Map();
    }

    updateNodeStatus(message) {
        this.nodeData.clear();

        message.node.forEach((nodeStatus) => {
            const nodeName = nodeStatus.key;
            const cpuUsage = nodeStatus.pCpu;
            const memUsage = nodeStatus.Ram / (1024 * 1024); // bytes to MB

            this.nodeData.set(nodeName, {
                cpu: cpuUsage,
                cpuErrorLevel: nodeStatus.CpuErrorLevel,
                mem: memUsage,
            });

            // CPU 사용률 경고
            if (cpuUsage > 90) {
                window.getLogManager()?.error(`Node ${nodeName}: high CPU usage - ${cpuUsage.toFixed(2)}%`);
            } else if (cpuUsage > 80) {
                window.getLogManager()?.warning(`Node ${nodeName}: elevated CPU usage - ${cpuUsage.toFixed(2)}%`);
            }
        });

        this.updateTable();
    }

    updateTable() {
        this.tbody.innerHTML = "";

        if (this.nodeData.size === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");
            cell.colSpan = 4;
            cell.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #95a5a6;">
                    <div style="font-size: 3rem; margin-bottom: 10px;">🔗</div>
                    <div style="font-style: italic;">노드 데이터를 기다리는 중...</div>
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
            nameCell.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 1.2rem;">⚡</span>
                    <span style="font-weight: 500;">${nodeName}</span>
                </div>
            `;
            row.appendChild(nameCell);

            // CPU 사용률
            const cpuCell = document.createElement("td");
            const cpuValue = data.cpu.toFixed(2);
            let cpuColor = "#27ae60";
            let cpuIcon = "🟢";
            let cpuClass = "";

            if (data.cpu > 90) {
                cpuColor = "#e74c3c";
                cpuIcon = "🔴";
                cpuClass = "error-cell";
            } else if (data.cpu > 70) {
                cpuColor = "#f39c12";
                cpuIcon = "🟡";
                cpuClass = "warning-cell";
            }

            cpuCell.className = cpuClass;
            cpuCell.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span>${cpuIcon}</span>
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
            const memIcon = this.getMemoryIcon(data.mem);

            memCell.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 1.1rem;">${memIcon}</span>
                    <div>
                        <div style="font-weight: 600; color: #34495e;">${memValue} MB</div>
                        <div style="font-size: 0.8rem; color: #7f8c8d;">${this.formatMemorySize(data.mem)}</div>
                    </div>
                </div>
            `;
            row.appendChild(memCell);

            // Status
            const statusCell = document.createElement("td");
            let statusText = "Healthy";
            let statusColor = "#27ae60";
            let statusIcon = "✅";

            if (data.cpu > 90) {
                statusText = "High Load";
                statusColor = "#e74c3c";
                statusIcon = "🚨";
            } else if (data.cpu > 70) {
                statusText = "Medium Load";
                statusColor = "#f39c12";
                statusIcon = "⚠️";
            } else if (data.cpu < 1) {
                statusText = "Idle";
                statusColor = "#95a5a6";
                statusIcon = "😴";
            }

            statusCell.innerHTML = `
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span>${statusIcon}</span>
                    <span style="font-weight: 600; color: ${statusColor};">${statusText}</span>
                </div>
            `;
            row.appendChild(statusCell);

            this.tbody.appendChild(row);
        });
    }

    getMemoryIcon(memMB) {
        if (memMB < 10) {
            return "🟢";
        } else if (memMB < 100) {
            return "🟡";
        } else if (memMB < 500) {
            return "🟠";
        } else {
            return "🔴";
        }
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
}
