import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

class MessagingWebSocket extends WebSocket {
    sendMessage<T extends {}>(message: string, data: T) {
        const payload = JSON.stringify({
            message,
            data
        });
        this.send(payload);
    }
}

function WatcherApp() {
    const [message, setMessage] = useState("Connecting to websocket...");
    const [id, setId] = useState("");

    useEffect(() => {
        const ws = new MessagingWebSocket(import.meta.env.VITE_WSHOST);

        ws.onopen = () => {
            setMessage("WebSocket connection established!");
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
                setId(data.id);
            }
        };

        ws.onclose = () => {
            setMessage("WebSocket connection closed.");
            ws.close()
        };

        ws.onerror = (error) => {
            setMessage("WebSocket error occurred.");
        };

        return () => ws.close();
    }, []);

    return <>
        <p id="status">{message}</p>
        <p id="id_display">{id}</p>
    </>;
}

const root = createRoot(document.querySelector("#watcher-app")!);

root.render(
    <WatcherApp />
);

