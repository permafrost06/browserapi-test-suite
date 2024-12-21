class MessagingWebSocket extends WebSocket {
    sendMessage<T extends {}>(message: string, data: T) {
        const payload = JSON.stringify({
            message,
            data
        });
        this.send(payload);
    }
}

const statusElement = document.getElementById("status")!;
const ws = new MessagingWebSocket(`ws://${location.host}`);

ws.onopen = () => {
    statusElement.textContent = "WebSocket connection established!";
};

ws.onmessage = (event) => {
    const payload = JSON.parse(event.data);

    if (payload.message === "select-runner") {
        const { runnerIDs } = payload.data;
        ws.sendMessage("runner-selection", {
            runnerID: runnerIDs[runnerIDs.length - 1]
        });
    }

    if (payload.message === "runner-connected") {
         document.querySelector<HTMLDivElement>("#id_display")!.innerText = payload.data.runnerID;
    }
};

ws.onclose = () => {
    statusElement.textContent = "WebSocket connection closed.";
};

ws.onerror = (error) => {
    statusElement.textContent = "WebSocket error occurred.";
    console.error("WebSocket error:", error);
};
