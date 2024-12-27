import express from "express";
import type { Request, Response } from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

class MessagingWebSocket extends WebSocket {
    sendMessage<T extends {}>(message: string, data: T) {
        const payload = JSON.stringify({
            message,
            data
        });
        this.send(payload);
    }
}

const app = express();
const PORT = 5173;
const __dirname = dirname(fileURLToPath(import.meta.url));

let registeredRunners: Array<number> = [];

let connections: {
    runnerID?: number;
    socket: MessagingWebSocket;
}[] = [];

app.use(express.static("dist"));
app.use(express.json());

app.get("/", (_: Request, res: Response) => {
    res.sendFile(join(__dirname, "dist", "index.html"));
});

app.get("/watcher", (_: Request, res: Response) => {
    res.sendFile(join(__dirname, "dist", "watcher.html"));
});

app.get("/runner", (_: Request, res: Response) => {
    res.sendFile(join(__dirname, "dist", "runner.html"));
});

app.post("/register-test-runner", (req, res) => {
    registeredRunners.push(req.body.id);

    if (registeredRunners.length === 1) {
        connections = connections.map(conn => ({
            ...conn,
            runnerID: req.body.id,
        }));
        connections.forEach(connection => {
            connection.socket.sendMessage(
                "runner-connected",
                { id: registeredRunners[0] }
            );
        });
    }

    res.status(200).send();
});

app.post("/remove-test-runner", (req, res) => {
    registeredRunners = registeredRunners
        .filter(id => id !== req.body.id);
    res.status(200).send();
});

const server = createServer(app);
const wsServer = new WebSocketServer({
    server,
    WebSocket: MessagingWebSocket
});

const handleSocketMessage = (socket: MessagingWebSocket, message: string) => {
    let payload: {
        message?: string;
        data?: Record<string, any>;
    } = {};

    try {
        payload = JSON.parse(message);
    } catch (e) {
        console.log("received message is not JSON");
    }

    if (!payload.message || !payload.data) {
        console.log("invalid message received");
        return
    }

    if (payload.message === "runner-selection") {
        const { runnerID } = payload.data;

        connections.find(
            sock => sock.socket === socket
        )!.runnerID = runnerID;

        socket.sendMessage(
            "runner-connected",
            { id: registeredRunners.find(id => id === runnerID) }
        );
    }
}

wsServer.on("connection", (socket) => {
    socket.on("close", () => {
        connections = connections.filter(sock => sock.socket === socket);
    });

    socket.on("message", (message: string) => {
        handleSocketMessage(socket, message);
    });

    if (registeredRunners.length === 1) {
        connections.push({
            runnerID: registeredRunners[0],
            socket,
        });

        socket.sendMessage("runner-connected", { id: registeredRunners[0] });

        return;
    }

    connections.push({
        socket,
    });

    if (registeredRunners.length > 1) {
        socket.sendMessage("select-runner", {
            runnerIDs: registeredRunners
        });
    }
});

server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

