import dotenv from "dotenv";
dotenv.config({ silent: process.env.NODE_ENV === "production" });
import express, { json } from "express";
import cors from "cors";
import {
  PollyClient,
  DescribeVoicesCommand,
  SynthesizeSpeechCommand,
} from "@aws-sdk/client-polly";
import { fileURLToPath } from "url";
import { dirname } from "path";
const app = express();
const port = 3000;
// use it before all route definitions
app.use(cors({ origin: "*" }));

app.use(json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ruta para obtener la lista de voces

app.use(express.static(__dirname + "/public"));

const client = new PollyClient({
  credentials: {
    accessKeyId: process.env.API_ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
  region: "us-east-1",
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
  console.log(__dirname);
});

app.get("/api/voices", async (req, res) => {
  try {
    const input = {};
    const command = new DescribeVoicesCommand(input);
    const result = await client.send(command);
    const voices = [...result.Voices];
    // Realiza una solicitud a Google Cloud Text-to-Speech para obtener la lista de voces
    const voiceNames = voices.map((voice) => ({
      name: voice.Id,
      gender: voice.Gender,
      displayName: `${voice.LanguageName.split(" ")
        .reverse()
        .join(", ")} ------- ${voice.Id}, ${voice.Gender}`,
      languageCode: voice.LanguageCode,
      supportedEngine: voice.SupportedEngines.some((el) => el === "neural")
        ? "neural"
        : voice.SupportedEngines[0],
    }));

    res.json(voiceNames);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred." });
  }
});

// Ruta para convertir texto a voz
app.post("/api/convert", async (req, res) => {
  // ... Código para convertir texto a voz ...
  const input = {
    Engine: req.body.engine,
    LanguageCode: req.body.languageCode,
    VoiceId: req.body.voice,
    Text: req.body.text,
    TextType: "text",
    OutputFormat: "mp3",
  };

  const command = new SynthesizeSpeechCommand(input);
  const response = await client.send(command);
  const audioStream = response.AudioStream;
  res.setHeader("Content-Type", "audio/mpeg"); // Set appropriate content type
  res.setHeader("Content-Disposition", "inline");
  audioStream.on("data", (chunk) => {
    res.write(chunk);
  });

  audioStream.on("end", () => {
    res.end();
  });
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
export default app;
