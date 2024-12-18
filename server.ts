import express from "express";
import type { Request, Response } from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { join, dirname } from "path";
import { fileURLToPath } from 'url';

const app = express();
const PORT = 5173;
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static("dist"));
app.use(express.json());

const server = createServer(app);
const wss = new WebSocketServer({ server });

const connections: Array<WebSocket> = [];

function broadcastTestList(message: string) {
    connections.forEach(conn => {
        conn.send(JSON.stringify({
            message: "tests-list",
            payload: message,
        }));
    });
}

function broadcastTestResult(message: string) {
    connections.forEach(conn => {
        conn.send(JSON.stringify({
            message: "test-result",
            payload: message,
        }));
    });
}

app.get("/", (_: Request, res: Response) => {
    res.sendFile(join(__dirname, "dist", "index.html"));
});

app.get("/test", (_: Request, res: Response) => {
    res.sendFile(join(__dirname, "dist", "test.html"));
});

app.post("/register-tester", (req, res) => {
    console.log(req.body);
    broadcastTestList(req.body);
    res.status(200).send({ message: "ok" });
});

app.post("/test-result", (req, res) => {
    console.log(req.body);
    broadcastTestResult(req.body);
    res.status(200).send({ message: "ok" });
});

wss.on("connection", (ws) => {
    connections.push(ws);

    ws.on("message", (message: string) => {
        console.log(`Received message: ${message}`);
    });

    ws.on("close", () => {
        console.log("Client disconnected");
    });
});

server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

