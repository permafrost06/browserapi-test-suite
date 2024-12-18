const statusElement = document.getElementById("status")!;
const ws = new WebSocket(`ws://${location.host}`);

ws.onopen = () => {
    statusElement.textContent = "WebSocket connection established!";
    ws.send("Hello Server!");
};

ws.onmessage = (event) => {
    console.log("Message from server:", event.data);
};

ws.onclose = () => {
    statusElement.textContent = "WebSocket connection closed.";
};

ws.onerror = (error) => {
    statusElement.textContent = "WebSocket error occurred.";
    console.error("WebSocket error:", error);
};
