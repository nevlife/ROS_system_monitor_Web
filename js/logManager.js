class LogManager {
    constructor() {
        this.logContainer = document.getElementById("log-container");
        this.maxLogs = 200;
        this.logCount = 0;
    }

    log(message, level = "info", withTimestamp = true) {
        let logEntry = document.createElement("div");
        logEntry.className = `log-entry ${level}`;

        let timestamp = "";
        if (withTimestamp) {
            timestamp = `[${new Date().toLocaleTimeString()}] `;
        }

        // 로그 레벨에 따른 아이콘 추가
        let icon = "";
        switch (level) {
            case "error":
                icon = "❌ ";
                break;
            case "warning":
                icon = "⚠️ ";
                break;
            case "info":
                icon = "ℹ️ ";
                break;
            default:
                icon = "📝 ";
        }

        logEntry.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 6px; line-height: 1.4;">
                <span style="flex-shrink: 0;">${icon}</span>
                <span style="font-weight: 500; color: #bdc3c7; flex-shrink: 0;">${timestamp}</span>
                <span style="flex: 1;">${message}</span>
            </div>
        `;

        // 로그 개수 제한
        if (this.logCount >= this.maxLogs) {
            this.logContainer.removeChild(this.logContainer.firstChild);
        } else {
            this.logCount++;
        }

        this.logContainer.appendChild(logEntry);

        // 스크롤을 맨 아래로 (부드러운 애니메이션)
        this.logContainer.scrollTo({
            top: this.logContainer.scrollHeight,
            behavior: 'smooth'
        });

        // 새 로그 항목에 하이라이트 효과
        logEntry.style.opacity = "0";
        logEntry.style.transform = "translateX(-10px)";
        
        setTimeout(() => {
            logEntry.style.transition = "all 0.3s ease";
            logEntry.style.opacity = "1";
            logEntry.style.transform = "translateX(0)";
        }, 10);
    }

    error(message) {
        this.log(message, "error");
        // 에러 로그는 브라우저 콘솔에도 출력
        console.error(`[ROS Monitor] ${message}`);
    }

    warning(message) {
        this.log(message, "warning");
        // 경고 로그는 브라우저 콘솔에도 출력
        console.warn(`[ROS Monitor] ${message}`);
    }

    info(message) {
        this.log(message, "info");
        // 정보 로그는 브라우저 콘솔에도 출력
        console.info(`[ROS Monitor] ${message}`);
    }

    // 로그 클리어 기능 추가
    clear() {
        this.logContainer.innerHTML = "";
        this.logCount = 0;
        this.log("로그가 클리어되었습니다.", "info");
    }

    // 로그 내보내기 기능 추가
    export() {
        const logs = Array.from(this.logContainer.children).map(entry => {
            return entry.textContent;
        });
        
        const logText = logs.join('\n');
        const blob = new Blob([logText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `ros_monitor_logs_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.log("로그가 파일로 내보내졌습니다.", "info");
    }
}
