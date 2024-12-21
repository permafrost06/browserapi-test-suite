import express from "express";
import type { Request, Response } from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

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
    res.status(200).send();
});

app.post("/remove-test-runner", (req, res) => {
    registeredRunners = registeredRunners
        .filter(runner => runner.id !== req.body.id);
    res.status(200).send();
});

const server = createServer(app);
const wsServer = new WebSocketServer({ server });

wsServer.on("connection", (ws) => {
    console.log("Client connected");

    ws.send("Hello from WebSocket server!");

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

