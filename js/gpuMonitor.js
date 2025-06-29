class GpuMonitor {
    constructor() {
        this.tbody = document.getElementById("gpu-tbody");
        this.gpuData = new Map();
    }

    updateGpuProcesses(message) {
        this.gpuData.clear();

        message.gpu_proc.forEach((gpuProc) => {
            const pid = gpuProc.pid.toString();

            this.gpuData.set(pid, {
                type: gpuProc.proc_type,
                sm: gpuProc.sm_util,
                mem: gpuProc.mem_util,
                command: gpuProc.command,
                username: gpuProc.username,
                procName: gpuProc.proc_name,
                gpuMem: gpuProc.gpu_mem,
            });
        });

        this.updateTable();
    }

    updateTable() {
        this.tbody.innerHTML = "";

        if (this.gpuData.size === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");
            cell.colSpan = 9;
            cell.textContent = "No GPU processes found";
            cell.style.textAlign = "center";
            cell.style.fontStyle = "italic";
            cell.style.color = "#666";
            row.appendChild(cell);
            this.tbody.appendChild(row);
            return;
        }

        const sortedPids = Array.from(this.gpuData.keys()).sort((a, b) => parseInt(a) - parseInt(b));

        sortedPids.forEach((pid) => {
            const data = this.gpuData.get(pid);
            const row = document.createElement("tr");

            // PID
            const pidCell = document.createElement("td");
            pidCell.textContent = pid;
            row.appendChild(pidCell);

            // Type
            const typeCell = document.createElement("td");
            typeCell.textContent = data.type || "-";
            row.appendChild(typeCell);

            // SM Usage
            const smCell = document.createElement("td");
            if (typeof data.sm === "number") {
                smCell.textContent = `${data.sm.toFixed(2)}%`;
                if (data.sm >= 90) {
                    smCell.className = "error-cell";
                } else if (data.sm >= 75) {
                    smCell.className = "warning-cell";
                }
            } else {
                smCell.textContent = "-";
            }
            row.appendChild(smCell);

            // Memory Usage
            const memCell = document.createElement("td");
            if (typeof data.mem === "number") {
                memCell.textContent = `${data.mem.toFixed(2)}%`;
                if (data.mem >= 90) {
                    memCell.className = "error-cell";
                } else if (data.mem >= 75) {
                    memCell.className = "warning-cell";
                }
            } else {
                memCell.textContent = "-";
            }
            row.appendChild(memCell);

            // Enc, Dec, Jpg, Ofa (현재 데이터 없음)
            for (let i = 0; i < 4; i++) {
                const emptyCell = document.createElement("td");
                emptyCell.textContent = "-";
                row.appendChild(emptyCell);
            }

            // Command
            const commandCell = document.createElement("td");
            commandCell.textContent = data.command || "-";
            commandCell.style.maxWidth = "200px";
            commandCell.style.overflow = "hidden";
            commandCell.style.textOverflow = "ellipsis";
            commandCell.style.whiteSpace = "nowrap";
            commandCell.title = data.command || "-"; // 툴팁으로 전체 명령어 표시
            row.appendChild(commandCell);

            this.tbody.appendChild(row);
        });
    }
}
