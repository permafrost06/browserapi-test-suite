import express from "express";
import type { Request, Response } from "express";
import { createServer } from "http";
import { join, dirname } from "path";
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static("dist"));

app.get("/", (_: Request, res: Response) => {
  res.sendFile(join(__dirname, "dist", "index.html"));
});

app.get("/test", (_: Request, res: Response) => {
  res.sendFile(join(__dirname, "dist", "test.html"));
});

const server = createServer(app);

server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

