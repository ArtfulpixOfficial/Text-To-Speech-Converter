const baseUrl = `http://127.0.0.1:3000`;

document.addEventListener("DOMContentLoaded", async function () {
  const inputText = document.getElementById("input-text");
  const voiceSelector = document.getElementById("voice-selector");
  const convertButton = document.getElementById("convert-button");
  const audioPlayer = document.getElementById("audio-player");
  const downloadButton = document.getElementById("download-button");

  // Llena el selector de voces
  // Fill the voice selector with available voices from the API endpoint
  await fetch(`http://127.0.0.1:3000/api/voices`) // Esta ruta debe coincidir con la que configuraste en server.js
    .then((response) => response.json())
    .then((data) => {
      data.forEach((voice) => {
        const option = document.createElement("option");
        option.value = voice.name;
        option.dataset.gender = voice.gender;
        option.dataset.languageCode = voice.languageCode;
        option.textContent = voice.displayName;
        voiceSelector.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  convertButton.addEventListener("click", async function (e) {
    e.preventDefault();
    const text = inputText.value;
    const selectedOption = voiceSelector.options[voiceSelector.selectedIndex];
    const selectedVoice = selectedOption.value;
    const selectedGender = selectedOption.dataset.gender;
    const selectedLanguageCode = selectedOption.dataset.languageCode;

    // Realiza una solicitud a tu API personalizada para convertir texto a voz
    // Converting text to speech
    await fetch(`http://127.0.0.1:3000/api/convert`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
        voice: selectedVoice,
        gender: selectedGender,
        languageCode: selectedLanguageCode,
      }),
    })
      .then((response) => response.blob())
      .then((blob) => {
        audioPlayer.src = URL.createObjectURL(blob);
        audioPlayer.play();

        // Download Functionality
        downloadButton.addEventListener("click", () => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;

          // You can change the filename if needed
          a.download = "converted_audio.mp3";

          a.style.display = "none";
          // document.body.appendChild(a);
          a.click();
          URL.revokeObjectURL(url);
        });
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
});
