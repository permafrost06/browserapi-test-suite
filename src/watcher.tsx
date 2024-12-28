import { useEffect, useRef, useState } from "react";
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
    const socket = useRef<MessagingWebSocket | undefined>(undefined);
    const [wsStatus, setWsStatus] = useState<
        "CONNECTING" | "CONNECTED" | "DISCONNECTED" | "ERROR"
    >("CONNECTING");
    const [id, setId] = useState("");

    const [status, setStatus] = useState(suites.map(suite => ({
        name: suite.suiteName,
        tests: suite.getTests().map(test => ({
            description: test,
            status: undefined as "pass" | "fail" | undefined,
            error: undefined as string | undefined,
        }))
    })));

    function handleUpdate(data: {
        suiteName: string;
        test: string;
        result: "pass" | "fail",
        error: string,
    }) {
        const { suiteName, test, result, error } = data;

        const suiteIdx = status.findIndex(suite => suite.name === suiteName);
        const testIdx = status[suiteIdx].tests.findIndex(t => t.description === test);
        let newStatus = [...status];
        newStatus[suiteIdx].tests[testIdx].status = result;
        
        if (error) {
            newStatus[suiteIdx].tests[testIdx].error = error;
        }

        setStatus(newStatus);
    }

    function handleMessage(message: string, data: Record<string, any>) {
        if (!socket.current) {
            return;
        }

        switch (message) {
            case "select-runner":
                const { runnerIDs } = data;
                socket.current.sendMessage("runner-selection", {
                    runnerID: runnerIDs[runnerIDs.length - 1]
                });
                break;
            case "runner-connected":
                setId(data.id);
                break;
            case "update":
                handleUpdate(data as {
                    suiteName: string;
                    test: string;
                    result: "pass" | "fail";
                    error: string;
                });
                break;
        }
    }

    useEffect(() => {
        const ws = new MessagingWebSocket(import.meta.env.VITE_WSHOST);

        ws.onopen = () => {
            setWsStatus("CONNECTED");
            socket.current = ws;
        };

        ws.onmessage = (event) => {
            const { message, data } = JSON.parse(event.data);

            handleMessage(message, data);
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
            {status.map(suite => <div className="suite-container">
                <div className="suite-name">{suite.name}</div>
                <div className="tests-container">
                    {suite.tests.map(test => <div className="test">
                        <div className="test-desc">
                            {test.description} <span>
                                {test.status === "pass" && "✔️"}
                                {test.status === "fail" && "❌"}
                            </span>
                        </div>
                        {test.error && <div className="error">
                            {test.error}
                        </div>}
                    </div>)}
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

