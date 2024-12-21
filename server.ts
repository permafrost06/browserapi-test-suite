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

type TestSuiteDescription = {
    id: number;
    suites: string[];
}

const app = express();
const PORT = 5173;
const __dirname = dirname(fileURLToPath(import.meta.url));

let registeredRunners: Array<{
    id: number;
    suites: TestSuiteDescription[]
}> = [];

let sockets: {
    runnerID?: number;
    socket: WebSocket;
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
    registeredRunners.push({
        id: req.body.id,
        suites: req.body.testSuites,
    });

    if (registeredRunners.length === 1) {
        sockets = sockets.map(socket => socket.runnerID = req.body.id);
    }

    res.status(200).send();
});

app.post("/remove-test-runner", (req, res) => {
    registeredRunners = registeredRunners
        .filter(runner => runner.id !== req.body.id);
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
    } catch(e) {
        console.log("received message is not JSON");
    }

    if (!payload.message) {
        console.log("invalid message received");
        return
    }

    if (payload.message === "runner-selection") {
        sockets.find(
            sock => sock.socket === socket
        )!.runnerID = payload.data?.runnerID;

        socket.sendMessage("runner-connected", {
            runnerID: payload.data?.runnerID
        });
    }
}

wsServer.on("connection", (socket) => {
    socket.on("close", () => {
        sockets = sockets.filter(sock => sock.socket === socket);
    });

    socket.on("message", (message: string) => {
        handleSocketMessage(socket, message);
    });

    if (registeredRunners.length === 1) {
        sockets.push({
            runnerID: registeredRunners[0].id,
            socket,
        });

        socket.sendMessage("runner-connected", {
            runnerID: registeredRunners[0].id
        });

        return;
    }

    sockets.push({
        socket,
    });

    if (registeredRunners.length > 1) {
        socket.sendMessage("select-runner", {
            runnerIDs: registeredRunners.map(runner => runner.id)
        });
    }
});

server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

