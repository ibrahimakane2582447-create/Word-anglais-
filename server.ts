import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/api/audio", async (req, res) => {
  const text = req.query.text as string;
  if (!text) {
    return res.status(400).send("Text is required");
  }
  try {
    const url = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(text)}&type=2`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch from youdao");
    }
    const arrayBuffer = await response.arrayBuffer();
    res.set("Content-Type", "audio/mpeg");
    res.set("Cache-Control", "public, max-age=31536000"); // Cache locally for 1 year
    res.send(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error("Audio proxy error:", error);
    res.status(500).send("Error fetching audio");
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
