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

        // CPU 상태에 따른 이모지와 색상
        let cpuIcon = "💻";
        let cpuColor = "#2c3e50";
        
        if (message.CpuErrorLevel > 1) {
            cpuIcon = "🔥";
            cpuColor = "#e74c3c";
        } else if (message.CpuErrorLevel > 0) {
            cpuIcon = "⚠️";
            cpuColor = "#f39c12";
        } else if (message.pCpu > 80) {
            cpuIcon = "🏃";
            cpuColor = "#f39c12";
        } else if (message.pCpu > 50) {
            cpuIcon = "🚶";
            cpuColor = "#3498db";
        } else {
            cpuIcon = "😴";
            cpuColor = "#27ae60";
        }

        this.cpuElement.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px; color: ${cpuColor};">
                <span style="font-size: 1.5rem;">${cpuIcon}</span>
                <div>
                    <div style="font-weight: 600; font-size: 1.1rem;">CPU: ${cpuUsage}% | Temp: ${cpuTemp}°C</div>
                    <div style="font-size: 0.9rem; opacity: 0.8;">Load: ${load1}, ${load5}, ${load15}</div>
                </div>
            </div>
        `;
    }

    updateMemoryInfo(message) {
        const memUsed = (message.ramUsed / (1024 * 1024))?.toFixed(2) || "-";
        const memTotal = (message.ramTotal / (1024 * 1024))?.toFixed(2) || "-";
        const memPercent = message.ramTotal > 0 ? ((message.ramUsed / message.ramTotal) * 100).toFixed(2) : "-";

        // 메모리 상태에 따른 이모지와 색상
        let memIcon = "🧠";
        let memColor = "#2c3e50";
        
        if (message.RamErrorLevel > 1) {
            memIcon = "🚨";
            memColor = "#e74c3c";
        } else if (message.RamErrorLevel > 0) {
            memIcon = "⚠️";
            memColor = "#f39c12";
        } else if (memPercent > 80) {
            memIcon = "📈";
            memColor = "#f39c12";
        } else if (memPercent > 60) {
            memIcon = "📊";
            memColor = "#3498db";
        } else {
            memIcon = "✅";
            memColor = "#27ae60";
        }

        this.memoryElement.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px; color: ${memColor};">
                <span style="font-size: 1.5rem;">${memIcon}</span>
                <div>
                    <div style="font-weight: 600; font-size: 1.1rem;">Mem: ${memUsed}/${memTotal} MB</div>
                    <div style="font-size: 0.9rem; opacity: 0.8;">Usage: ${memPercent}%</div>
                </div>
            </div>
        `;
    }

    updateGpuInfo(message) {
        const gpuUsage = message.pGpu?.toFixed(2) || "-";
        const gpuMemUsed = (message.gpuMemUsed / (1024 * 1024))?.toFixed(2) || "-";
        const gpuMemTotal = (message.gpuMemTotal / (1024 * 1024))?.toFixed(2) || "-";
        const gpuTemp = message.GpuTemp?.toFixed(2) || "-";

        // GPU 상태에 따른 이모지와 색상
        let gpuIcon = "🎮";
        let gpuColor = "#2c3e50";
        
        if (message.GpuErrorLevel > 1 || message.GpuMemErrorLevel > 1) {
            gpuIcon = "🔥";
            gpuColor = "#e74c3c";
        } else if (message.GpuErrorLevel > 0 || message.GpuMemErrorLevel > 0) {
            gpuIcon = "⚠️";
            gpuColor = "#f39c12";
        } else if (message.pGpu > 80) {
            gpuIcon = "🚀";
            gpuColor = "#3498db";
        } else if (message.pGpu > 50) {
            gpuIcon = "⚡";
            gpuColor = "#27ae60";
        } else {
            gpuIcon = "😴";
            gpuColor = "#95a5a6";
        }

        this.gpuElement.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px; color: ${gpuColor};">
                <span style="font-size: 1.5rem;">${gpuIcon}</span>
                <div>
                    <div style="font-weight: 600; font-size: 1.1rem;">GPU: ${gpuUsage}% | Temp: ${gpuTemp}°C</div>
                    <div style="font-size: 0.9rem; opacity: 0.8;">Mem: ${gpuMemUsed}/${gpuMemTotal} MB</div>
                </div>
            </div>
        `;
    }
}
