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

const ws = new MessagingWebSocket(import.meta.env.VITE_WSHOST);

ws.onopen = () => {
    statusElement.textContent = "WebSocket connection established!";
};

ws.onmessage = (event) => {
    const { message, data } = JSON.parse(event.data);

    if (message === "select-runner") {
        const { runnerIDs } = data;
        ws.sendMessage("runner-selection", {
            runnerID: runnerIDs[runnerIDs.length - 1]
        });
    }

    if (message === "runner-connected") {
        document.querySelector<HTMLDivElement>("#id_display")!.innerText = data.id;
    }
};

ws.onclose = () => {
    statusElement.textContent = "WebSocket connection closed.";
};

ws.onerror = (error) => {
    statusElement.textContent = "WebSocket error occurred.";
    console.error("WebSocket error:", error);
};
