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
                username: gpuProc.username,
                procName: gpuProc.proc_name,
                gpuMem: gpuProc.gpu_mem,
                smUtil: gpuProc.sm_util,
                memUtil: gpuProc.mem_util,
                procType: gpuProc.proc_type,
                command: gpuProc.command,
            });
        });

        this.updateTable();
    }

    updateTable() {
        this.tbody.innerHTML = "";

        if (this.gpuData.size === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");
            cell.colSpan = 8;
            cell.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #95a5a6;">
                    <div style="font-style: italic;">Not Found GPU Process</div>
                    <div style="font-size: 0.9rem; margin-top: 8px;">If GPU process is running, it will be displayed here</div>
                </div>
            `;
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
            pidCell.innerHTML = `<span style="font-weight: 600; color: #34495e;">${pid}</span>`;
            row.appendChild(pidCell);

            // Username
            const usernameCell = document.createElement("td");
            usernameCell.innerHTML = `<span style="font-weight: 500; color: #2c3e50;">${data.username || "-"}</span>`;
            row.appendChild(usernameCell);

            // Process Name
            const procNameCell = document.createElement("td");
            procNameCell.innerHTML = `<span style="font-weight: 500; color: #34495e;">${data.procName || "-"}</span>`;
            row.appendChild(procNameCell);

            // GPU Memory
            const gpuMemCell = document.createElement("td");
            gpuMemCell.innerHTML = `<span style="font-weight: 500; color: #7f8c8d;">${data.gpuMem || "-"}</span>`;
            row.appendChild(gpuMemCell);

            // SM Usage
            const smCell = document.createElement("td");
            const smValue = data.smUtil || "-";
            if (smValue !== "-") {
                smCell.innerHTML = `<span style="font-weight: 600; color: #34495e;">${smValue}</span>`;
            } else {
                smCell.innerHTML = `<span style="color: #bdc3c7;">-</span>`;
            }
            row.appendChild(smCell);

            // Memory Usage
            const memCell = document.createElement("td");
            const memValue = data.memUtil || "-";
            if (memValue !== "-") {
                memCell.innerHTML = `<span style="font-weight: 600; color: #34495e;">${memValue}</span>`;
            } else {
                memCell.innerHTML = `<span style="color: #bdc3c7;">-</span>`;
            }
            row.appendChild(memCell);

            // Type
            const typeCell = document.createElement("td");
            typeCell.innerHTML = `<span style="font-weight: 500; color: #34495e;">${data.procType || "-"}</span>`;
            row.appendChild(typeCell);

            // Command
            const commandCell = document.createElement("td");
            const command = data.command || "-";
            const shortCommand = command.length > 30 ? command.substring(0, 30) + "..." : command;

            commandCell.innerHTML = `
                <span style="font-family: 'Consolas', 'Monaco', monospace; font-size: 0.85rem; color: #34495e;" title="${command}">
                    ${shortCommand}
                </span>
            `;
            commandCell.style.maxWidth = "250px";
            commandCell.style.overflow = "hidden";
            commandCell.style.textOverflow = "ellipsis";
            commandCell.style.whiteSpace = "nowrap";
            row.appendChild(commandCell);

            this.tbody.appendChild(row);
        });
    }

    reset() {
        this.gpuData.clear();
        this.tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; color: #95a5a6; font-style: italic; padding: 40px;">
                    Loading GPU process information...
                </td>
            </tr>
        `;
    }
}
