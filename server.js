const express = require("express");
const cors = require("cors");
const { TextToSpeechClient } = require("@google-cloud/text-to-speech");
const app = express();
const port = 3000;

// use it before all route definitions
app.use(cors({ origin: "*" }));

app.use(express.json());

// Configura la autenticación de Google Cloud Text-to-Speech
const client = new TextToSpeechClient({
  keyFilename:
    "../Text To Speech Final/animated-canyon-403420-aee5ce8ac09e.json",
});

// Ruta para obtener la lista de voces
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

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});