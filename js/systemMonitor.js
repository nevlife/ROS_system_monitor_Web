class SystemMonitor {
    constructor() {
        this.cpuElement = document.getElementById("cpu-info");
        this.memoryElement = document.getElementById("memory-info");
        this.gpuElement = document.getElementById("gpu-info");
    }

    updateSystemStatus(message) {
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

        this.cpuElement.textContent = `CPU: ${cpuUsage}% | Temp: ${cpuTemp}°C | Load: ${load1}, ${load5}, ${load15}`;

        // CPU 경고 표시
        if (message.CpuErrorLevel > 1) {
            this.cpuElement.style.color = "#e74c3c";
        } else if (message.CpuErrorLevel > 0) {
            this.cpuElement.style.color = "#f39c12";
        } else {
            this.cpuElement.style.color = "#2c3e50";
        }
    }

    updateMemoryInfo(message) {
        const memUsed = (message.ramUsed / (1024 * 1024))?.toFixed(2) || "-";
        const memTotal = (message.ramTotal / (1024 * 1024))?.toFixed(2) || "-";
        const memPercent = message.ramTotal > 0 ? ((message.ramUsed / message.ramTotal) * 100).toFixed(2) : "-";

        this.memoryElement.textContent = `Mem: ${memUsed}/${memTotal} MB (${memPercent}%)`;

        // 메모리 경고 표시
        if (message.RamErrorLevel > 1) {
            this.memoryElement.style.color = "#e74c3c";
        } else if (message.RamErrorLevel > 0) {
            this.memoryElement.style.color = "#f39c12";
        } else {
            this.memoryElement.style.color = "#2c3e50";
        }
    }

    updateGpuInfo(message) {
        const gpuUsage = message.pGpu?.toFixed(2) || "-";
        const gpuMemUsed = (message.gpuMemUsed / (1024 * 1024))?.toFixed(2) || "-";
        const gpuMemTotal = (message.gpuMemTotal / (1024 * 1024))?.toFixed(2) || "-";
        const gpuTemp = message.GpuTemp?.toFixed(2) || "-";

        this.gpuElement.textContent = `GPU: ${gpuUsage}% | Mem: ${gpuMemUsed}/${gpuMemTotal} MB | Temp: ${gpuTemp}°C`;

        // GPU 경고 표시
        if (message.GpuErrorLevel > 1 || message.GpuMemErrorLevel > 1) {
            this.gpuElement.style.color = "#e74c3c";
        } else if (message.GpuErrorLevel > 0 || message.GpuMemErrorLevel > 0) {
            this.gpuElement.style.color = "#f39c12";
        } else {
            this.gpuElement.style.color = "#2c3e50";
        }
    }
}
