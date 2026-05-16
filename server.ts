import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-load Gemini client
let genAI: GoogleGenAI | null = null;
function getGenAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }
    genAI = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return genAI;
}

// AI Chat Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    const ai = getGenAI();
    
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `Tu es IBKane IA, un assistant éducatif expert en Français et en Anglais. 
        Ton but est d'aider l'utilisateur à apprendre ces deux langues. 
        Réponds de manière amicale, encourageante et très précise. 
        IMPORTANT: Ne JAMAIS utiliser de symboles de formatage Markdown comme les astérisques (***), les dièses (###) ou les listes à puces complexes. 
        Donne des réponses en texte brut clair et bien structuré avec des sauts de ligne simples.
        Si l'utilisateur pose des questions sur l'éducation, les langues ou demande des dialogues de pratique, sois très détaillé.
        Garde tes réponses riches en contenu pédagogique mais faciles à lire.`,
      },
      history: history || [],
    });

    const result = await chat.sendMessage({ message });
    res.json({ text: result.text });
  } catch (error: any) {
    console.error("AI Error:", error);
    res.status(500).json({ error: error.message || "Une erreur est survenue avec l'IA." });
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
