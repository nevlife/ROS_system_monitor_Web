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
            timestamp = `[${new Date().toLocaleTimeString("en-US", { hour12: false })}] `;
        }

        logEntry.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 6px; line-height: 1.4;">
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
            behavior: "smooth",
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
        this.log("Log cleared", "info");
    }
}
