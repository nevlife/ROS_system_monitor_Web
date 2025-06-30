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
            cell.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #95a5a6;">
                    <div style="font-size: 3rem; margin-bottom: 10px;">🖥️</div>
                    <div style="font-style: italic;">GPU 프로세스가 감지되지 않았습니다</div>
                    <div style="font-size: 0.9rem; margin-top: 8px;">GPU를 사용하는 프로세스가 실행되면 여기에 표시됩니다</div>
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
            pidCell.innerHTML = `
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="font-size: 1.1rem;">🆔</span>
                    <span style="font-weight: 600; color: #34495e;">${pid}</span>
                </div>
            `;
            row.appendChild(pidCell);

            // Type
            const typeCell = document.createElement("td");
            const typeIcon = this.getTypeIcon(data.type);
            typeCell.innerHTML = `
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span>${typeIcon}</span>
                    <span style="font-weight: 500;">${data.type || "-"}</span>
                </div>
            `;
            row.appendChild(typeCell);

            // SM Usage
            const smCell = document.createElement("td");
            if (typeof data.sm === "number") {
                const smValue = data.sm.toFixed(2);
                let smColor = '#27ae60';
                let smIcon = '🟢';
                let smClass = '';

                if (data.sm >= 90) {
                    smColor = '#e74c3c';
                    smIcon = '🔴';
                    smClass = 'error-cell';
                } else if (data.sm >= 75) {
                    smColor = '#f39c12';
                    smIcon = '🟡';
                    smClass = 'warning-cell';
                }

                smCell.className = smClass;
                smCell.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <span>${smIcon}</span>
                        <div style="flex: 1;">
                            <div style="font-weight: 600; color: ${smColor};">${smValue}%</div>
                            <div style="background: #ecf0f1; border-radius: 10px; height: 4px; margin-top: 2px; overflow: hidden;">
                                <div style="background: ${smColor}; height: 100%; width: ${Math.min(data.sm, 100)}%; transition: width 0.3s ease;"></div>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                smCell.innerHTML = `<span style="color: #bdc3c7;">-</span>`;
            }
            row.appendChild(smCell);

            // Memory Usage
            const memCell = document.createElement("td");
            if (typeof data.mem === "number") {
                const memValue = data.mem.toFixed(2);
                let memColor = '#27ae60';
                let memIcon = '🟢';
                let memClass = '';

                if (data.mem >= 90) {
                    memColor = '#e74c3c';
                    memIcon = '🔴';
                    memClass = 'error-cell';
                } else if (data.mem >= 75) {
                    memColor = '#f39c12';
                    memIcon = '🟡';
                    memClass = 'warning-cell';
                }

                memCell.className = memClass;
                memCell.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <span>${memIcon}</span>
                        <div style="flex: 1;">
                            <div style="font-weight: 600; color: ${memColor};">${memValue}%</div>
                            <div style="background: #ecf0f1; border-radius: 10px; height: 4px; margin-top: 2px; overflow: hidden;">
                                <div style="background: ${memColor}; height: 100%; width: ${Math.min(data.mem, 100)}%; transition: width 0.3s ease;"></div>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                memCell.innerHTML = `<span style="color: #bdc3c7;">-</span>`;
            }
            row.appendChild(memCell);

            // Enc, Dec, Jpg, Ofa (현재 데이터 없음)
            for (let i = 0; i < 4; i++) {
                const emptyCell = document.createElement("td");
                emptyCell.innerHTML = `
                    <div style="text-align: center;">
                        <span style="color: #bdc3c7;">-</span>
                    </div>
                `;
                row.appendChild(emptyCell);
            }

            // Command
            const commandCell = document.createElement("td");
            const command = data.command || "-";
            const shortCommand = command.length > 30 ? command.substring(0, 30) + "..." : command;
            
            commandCell.innerHTML = `
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="font-size: 1.1rem;">💻</span>
                    <span style="font-family: 'Consolas', 'Monaco', monospace; font-size: 0.85rem; color: #34495e;" title="${command}">
                        ${shortCommand}
                    </span>
                </div>
            `;
            commandCell.style.maxWidth = "250px";
            commandCell.style.overflow = "hidden";
            commandCell.style.textOverflow = "ellipsis";
            commandCell.style.whiteSpace = "nowrap";
            row.appendChild(commandCell);

            this.tbody.appendChild(row);
        });
    }

    getTypeIcon(type) {
        if (!type) return '❓';
        
        const lowerType = type.toLowerCase();
        if (lowerType.includes('graphics') || lowerType.includes('render')) {
            return '🎨';
        } else if (lowerType.includes('compute') || lowerType.includes('cuda')) {
            return '🧮';
        } else if (lowerType.includes('ml') || lowerType.includes('ai') || lowerType.includes('tensor')) {
            return '🤖';
        } else if (lowerType.includes('video') || lowerType.includes('encode')) {
            return '🎬';
        } else {
            return '⚡';
        }
    }
}
