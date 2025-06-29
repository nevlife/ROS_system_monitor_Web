class LogManager {
    constructor() {
        this.logContainer = document.getElementById("log-container");
        this.maxLogs = 200;
        this.logCount = 0;
    }

    log(message, level = "info", withTimestamp = true) {
        let logEntry = document.createElement("div");
        logEntry.className = `log-entry ${level}`;

        if (withTimestamp) {
            const timestamp = new Date().toLocaleTimeString();
            message = `[${timestamp}] ${message}`;
        }

        logEntry.textContent = message;

        // 로그 개수 제한
        if (this.logCount >= this.maxLogs) {
            this.logContainer.removeChild(this.logContainer.firstChild);
        } else {
            this.logCount++;
        }

        this.logContainer.appendChild(logEntry);

        // 스크롤을 맨 아래로
        this.logContainer.scrollTop = this.logContainer.scrollHeight;
    }

    error(message) {
        this.log(message, "error");
    }

    warning(message) {
        this.log(message, "warning");
    }

    info(message) {
        this.log(message, "info");
    }
}
