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

        const sortedNodes = Array.from(this.nodeData.keys()).sort();

        sortedNodes.forEach((nodeName) => {
            const data = this.nodeData.get(nodeName);
            const row = document.createElement("tr");

            // 노드 이름
            const nameCell = document.createElement("td");
            nameCell.textContent = nodeName;
            row.appendChild(nameCell);

            // CPU 사용률
            const cpuCell = document.createElement("td");
            cpuCell.textContent = `${data.cpu.toFixed(2)}%`;
            if (data.cpu > 90) {
                cpuCell.className = "error-cell";
            } else if (data.cpu > 70) {
                cpuCell.className = "warning-cell";
            }
            row.appendChild(cpuCell);

            // 메모리 사용량
            const memCell = document.createElement("td");
            memCell.textContent = `${data.mem.toFixed(2)} MB`;
            row.appendChild(memCell);

            this.tbody.appendChild(row);
        });
    }
}
