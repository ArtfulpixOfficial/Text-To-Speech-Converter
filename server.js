import express, { json } from "express";
import cors from "cors";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import path from "path";
const app = express();

// use it before all route definitions
app.use(cors({ origin: "https://text-to-speech-converter-zeta.vercel.app" }));

app.use(json());

// Configura la autenticación de Google Cloud Text-to-Speech
const client = new TextToSpeechClient({
  keyFilename:
    "../Text To Speech Final/animated-canyon-403420-aee5ce8ac09e.json",
});

// Ruta para obtener la lista de voces
app.get("/", (req, res) => {
  const indexPath = path.join(__dirname, "index.html"); // Assuming the HTML file is in the same directory as 'server.js'
  res.sendFile(indexPath);
});

app.get("/api/voices", async (req, res) => {
  try {
    // Realiza una solicitud a Google Cloud Text-to-Speech para obtener la lista de voces
    const [result] = await client.listVoices({});
    const voices = result.voices;
    const voiceNames = voices.map((voice) => ({
      name: voice.name,
      gender: voice.ssmlGender,
      displayName: `${voice.name} - ${voice.ssmlGender}`,
      languageCode: voice.languageCodes[0],
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
  const request = {
    input: { text: req.body.text },
    voice: {
      name: req.body.voice,
      languageCode: req.body.languageCode,
      ssmlGender: req.body.gender,
    },
    audioConfig: { audioEncoding: "MP3" },
  };

  const [response] = await client.synthesizeSpeech(request);
  const audioContent = response.audioContent;
  res.setHeader("Content-Type", "audio/mpeg");
  res.send(audioContent);
});

// app.listen(port, () => {
//   console.log(`Server is listening on port ${port}`);
// });
export default app;
