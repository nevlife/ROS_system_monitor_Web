//wsl 내꺼 : http://172.28.191.188:9090
//ssc : http://223.171.137.66:9090
let ros = null;
let systemMonitor = null;
let topicMonitor = null;
let nodeMonitor = null;
let gpuMonitor = null;
let logManager = null;
let rosbagRecorder = null;
let isConnected = false;

// 구독자들을 저장할 변수
let subscribers = {
    systemStatus: null,
    topicStatus: null,
    nodeStatus: null,
    gpuProc: null,
};

// 애플리케이션 초기화
document.addEventListener("DOMContentLoaded", function () {
    // 로그 매니저 초기화
    logManager = new LogManager();
    logManager.log("ROS Monitor Web Interface Started");

    // 모니터링 컴포넌트들 초기화
    systemMonitor = new SystemMonitor();
    topicMonitor = new TopicMonitor();
    nodeMonitor = new NodeMonitor();
    gpuMonitor = new GpuMonitor();
    rosbagRecorder = new RosbagRecorder();

    // 연결 버튼 이벤트
    document.getElementById("connect-button").addEventListener("click", connectToRos);

    // 연결 상태 표시 업데이트
    updateConnectionStatus(false, "연결 대기");

    logManager.log("initialized all components");
});

// ROS 연결 함수
function connectToRos() {
    let url = document.getElementById("ros-url").value || "ws://localhost:9090";

    logManager.log(`original URL: "${url}"`);

    // URL 정리
    url = url.trim();
    logManager.log(`trimmed: "${url}"`);

    // 이미 올바른 WebSocket URL인지 먼저 확인
    if (url.startsWith("ws://") || url.startsWith("wss://")) {
        logManager.log("already valid WebSocket URL");
    }
    // 일반 HTTP URL을 WS로 변환
    else if (url.startsWith("http://")) {
        logManager.log("detected HTTP URL");
        url = url.replace("http://", "ws://");
        logManager.log(`converted HTTP URL to WS: ${url}`);
    }
    // 프로토콜이 없는 경우 ws:// 추가
    else {
        logManager.log("detected URL without protocol");
        url = "ws://" + url;
        logManager.log(`added protocol: ${url}`);
    }

    logManager.log(`final URL: "${url}"`);

    // URL 형식 검사
    try {
        new URL(url);
        logManager.log("URL format test passed");
    } catch (e) {
        logManager.log(`invalid URL format: ${url} - ${e.message}`, "error");
        updateConnectionStatus(false, "URL format error");
        return;
    }

    logManager.log(`connecting to ROS Bridge: ${url}`);
    updateConnectionStatus(false, "connecting...");

    ros = new ROSLIB.Ros({
        url: url,
    });

    ros.on("connection", function () {
        isConnected = true;
        updateConnectionStatus(true, "connected");
        logManager.log("successfully connected to ROS Bridge", "info");

        // 구독자들 설정
        setupSubscribers();

        // 연결 버튼을 Disconnect로 변경
        const connectBtn = document.getElementById("connect-button");
        connectBtn.disabled = false;
        connectBtn.textContent = "Disconnect";
        connectBtn.onclick = disconnectFromRos;
    });

    ros.on("error", function (error) {
        isConnected = false;
        updateConnectionStatus(false, "connection error");

        // 컴포넌트 초기화
        resetAllComponents();

        // 더 자세한 에러 정보 로깅
        console.error("ROS connection error:", error);
        console.error("error type:", typeof error);
        console.error("error content:", JSON.stringify(error, null, 2));

        logManager.log(`connection error details: ${JSON.stringify(error)}`, "error");

        // 연결 버튼을 다시 Connect로 변경
        const connectBtn = document.getElementById("connect-button");
        connectBtn.disabled = false;
        connectBtn.textContent = "Connect";
        connectBtn.onclick = connectToRos;
    });

    ros.on("close", function () {
        isConnected = false;
        updateConnectionStatus(false, "disconnected");

        // 컴포넌트 초기화 (의도하지 않은 연결 끊김인 경우)
        resetAllComponents();

        logManager.log("ROS Bridge disconnected", "warning");

        // 연결 버튼을 다시 Connect로 변경
        const connectBtn = document.getElementById("connect-button");
        connectBtn.disabled = false;
        connectBtn.textContent = "Reconnect";
        connectBtn.onclick = connectToRos;
    });
}

// ROS 연결 해제 함수
function disconnectFromRos() {
    if (ros && isConnected) {
        logManager.log("disconnecting from ROS Bridge");

        // 모든 구독자 해제
        unsubscribeAll();

        // 모든 컴포넌트 초기화
        resetAllComponents();

        // ROS 연결 종료
        ros.close();

        // 즉시 상태 업데이트 (close 이벤트를 기다리지 않음)
        isConnected = false;
        updateConnectionStatus(false, "disconnected");

        // 연결 버튼을 다시 Connect로 변경
        const connectBtn = document.getElementById("connect-button");
        connectBtn.textContent = "Connect";
        connectBtn.onclick = connectToRos;

        logManager.log("ROS Bridge disconnected", "info");
    }
}

// 구독자 설정
function setupSubscribers() {
    // 기존 구독자들이 있다면 먼저 해제
    unsubscribeAll();

    // 시스템 상태 구독
    subscribers.systemStatus = new ROSLIB.Topic({
        ros: ros,
        name: "/system_status",
        messageType: "ros_monitor/SystemStatus",
    });

    subscribers.systemStatus.subscribe(function (message) {
        systemMonitor.updateSystemStatus(message);
    });

    // 토픽 상태 구독
    subscribers.topicStatus = new ROSLIB.Topic({
        ros: ros,
        name: "/topic_hzbw",
        messageType: "ros_monitor/TopicStatusArray",
    });

    subscribers.topicStatus.subscribe(function (message) {
        topicMonitor.updateTopicStatus(message);
    });

    // 노드 상태 구독
    subscribers.nodeStatus = new ROSLIB.Topic({
        ros: ros,
        name: "/nodes_status",
        messageType: "ros_monitor/NodeStatusArray",
    });

    subscribers.nodeStatus.subscribe(function (message) {
        nodeMonitor.updateNodeStatus(message);
    });

    // GPU 프로세스 구독
    subscribers.gpuProc = new ROSLIB.Topic({
        ros: ros,
        name: "/gpu_proc_collector",
        messageType: "ros_monitor/GpuProcessArray",
    });

    subscribers.gpuProc.subscribe(function (message) {
        gpuMonitor.updateGpuProcesses(message);
    });

    logManager.log("all ROS topics subscribed");
}

// 모든 구독자 해제
function unsubscribeAll() {
    Object.keys(subscribers).forEach((key) => {
        if (subscribers[key]) {
            try {
                subscribers[key].unsubscribe();
                logManager.log(`unsubscribed: ${key}`);
            } catch (error) {
                logManager.log(`unsubscribe failed: ${key} - ${error.message}`, "warning");
            }
            subscribers[key] = null;
        }
    });
}

// 모든 컴포넌트 초기화
function resetAllComponents() {
    if (systemMonitor) systemMonitor.reset();
    if (topicMonitor) topicMonitor.reset();
    if (nodeMonitor) nodeMonitor.reset();
    if (gpuMonitor) gpuMonitor.reset();
    logManager.log("all components initialized");
}

// 연결 상태 업데이트
function updateConnectionStatus(connected, statusText) {
    const indicator = document.getElementById("status-indicator");
    const text = document.getElementById("status-text");

    if (connected) {
        indicator.className = "status-indicator connected";
    } else {
        indicator.className = "status-indicator disconnected";
    }

    text.textContent = statusText;
}

// ROS 객체를 다른 모듈에서 사용할 수 있도록 전역으로 노출
window.getRos = function () {
    return ros;
};

window.getLogManager = function () {
    return logManager;
};

window.isRosConnected = function () {
    return isConnected;
};
