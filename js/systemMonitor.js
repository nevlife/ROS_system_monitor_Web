class SystemMonitor {
    constructor() {
        this.cpuElement = document.getElementById("cpu-info");
        this.memoryElement = document.getElementById("memory-info");
        this.gpuElement = document.getElementById("gpu-info");
    }

    updateSystemStatus(message) {
        this.defaultColor = "#2c2c2c";
        this.errorColor = "#e74c3c";
        this.warningColor = "#f39c12";

        this.updateCpuInfo(message);
        this.updateMemoryInfo(message);
        this.updateGpuInfo(message);
    }

    updateCpuInfo(message) {
        const cpuUsage = message.pCpu?.toFixed(2) || "-";
        const cpuTemp = message.CpuTemp?.toFixed(2) || "-";
        const loadAvg = message.CpuLoadAvg || ["-", "-", "-"];

        const load1 = loadAvg[0]?.toFixed(2) || "-";
        const load5 = loadAvg[1]?.toFixed(2) || "-";
        const load15 = loadAvg[2]?.toFixed(2) || "-";

        let cpuColor = this.defaultColor;

        if (message.CpuErrorLevel === 2) {
            cpuColor = this.errorColor;
        } else if (message.CpuErrorLevel === 1) {
            cpuColor = this.warningColor;
        }

        this.cpuElement.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px; color: ${cpuColor};">
                <div>
                    <div style="font-weight: 600; font-size: 1.1rem;">CPU: ${cpuUsage}% | Temp: ${cpuTemp}°C</div>
                    <div style="font-weight: 600; font-size: 1.1rem;">Load: ${load1}, ${load5}, ${load15}</div>
                </div>
            </div>
        `;
    }

    updateMemoryInfo(message) {
        const memUsed = (message.ramUsed / (1024 * 1024))?.toFixed(2) || "-";
        const memTotal = (message.ramTotal / (1024 * 1024))?.toFixed(2) || "-";
        const memPercent = message.ramTotal > 0 ? ((message.ramUsed / message.ramTotal) * 100).toFixed(2) : "-";

        let memColor = this.defaultColor;

        if (message.RamErrorLevel === 2) {
            memColor = this.errorColor;
        } else if (message.RamErrorLevel === 1) {
            memColor = this.warningColor;
        }

        this.memoryElement.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px; color: ${memColor};">
                <div>
                    <div style="font-weight: 600; font-size: 1.1rem;">Mem: ${memUsed}/${memTotal} MB</div>
                    <div style="font-weight: 600; font-size: 1.1rem;">Usage: ${memPercent}%</div>
                </div>
            </div>
        `;
    }

    updateGpuInfo(message) {
        const gpuUsage = message.pGpu?.toFixed(2) || "-";
        const gpuMemUsed = (message.gpuMemUsed / (1024 * 1024))?.toFixed(2) || "-";
        const gpuMemTotal = (message.gpuMemTotal / (1024 * 1024))?.toFixed(2) || "-";
        const gpuTemp = message.GpuTemp?.toFixed(2) || "-";

        let gpuColor = this.defaultColor;

        if (message.GpuErrorLevel === 2 || message.GpuMemErrorLevel === 2 || message.GpuTempErrorLevel === 2) {
            gpuColor = this.errorColor;
        } else if (message.GpuErrorLevel === 1 || message.GpuMemErrorLevel === 1 || message.GpuTempErrorLevel === 1) {
            gpuColor = this.warningColor;
        }

        this.gpuElement.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px; color: ${gpuColor};">
                <div>
                    <div style="font-weight: 600; font-size: 1.1rem;">GPU: ${gpuUsage}% | Temp: ${gpuTemp}°C</div>
                    <div style="font-weight: 600; font-size: 1.1rem;">Mem: ${gpuMemUsed}/${gpuMemTotal} MB</div>
                </div>
            </div>
        `;
    }

    reset() {
        this.cpuElement.innerHTML = "CPU: -% | Temp: -°C | Load: -, -, -";
        this.memoryElement.innerHTML = "Mem: -/- MB (Usage: -%)";
        this.gpuElement.innerHTML = "GPU: -% | Mem: -/- MB | Temp: -°C";
    }
}
