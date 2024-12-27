import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import suites from "./tests";
import "./watcher.css";

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
    const [wsStatus, setWsStatus] = useState<
        "CONNECTING" | "CONNECTED" | "DISCONNECTED" | "ERROR"
    >("CONNECTING");
    const [id, setId] = useState("");

    const testSuites = suites.map(suite => ({
        name: suite.suiteName,
        tests: suite.getTests()
    }));

    useEffect(() => {
        const ws = new MessagingWebSocket(import.meta.env.VITE_WSHOST);

        ws.onopen = () => {
            setWsStatus("CONNECTED");
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
            setWsStatus("DISCONNECTED");
            ws.close()
        };

        ws.onerror = () => {
            setWsStatus("ERROR");
        };

        return () => ws.close();
    }, []);

    return <>
        <div className="watcher">
            <h1>Tests Watcher</h1>
            {testSuites.map(suite => <div className="suite-container">
                <div className="suite-name">{suite.name}</div>
                <div className="tests-container">
                    {suite.tests.map(test => <div className="test">{test}</div>)}
                </div>
            </div>)}
        </div>
        <footer>
            {wsStatus}{id && ` - ${id}`}
        </footer>
    </>;
}

const root = createRoot(document.querySelector("#watcher-app")!);

root.render(
    <WatcherApp />
);

