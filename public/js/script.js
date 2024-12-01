document.addEventListener("DOMContentLoaded", async function () {
  const messageSection = document.querySelector(".message");
  const heroSection = document.querySelector(".hero");
  const textInput = document.querySelector(".text-input");
  const inputText = document.getElementById("input-text");

  const voiceSelector = document.getElementById("voice-selector");
  const convertButton = document.getElementById("convert-button");
  const audioPlayer = document.getElementById("audio-player");
  const downloadButton = document.getElementById("download-button");
  const downloadBtnLink = document.getElementById("download-btn-link");

  // Llena el selector de voces
  // Fill the voice selector with available voices from the API endpoint
  await fetch(`/api/voices`) // Esta ruta debe coincidir con la que configuraste en server.js
    .then((response) => response.json())
    .then((data) => {
      data.forEach((voice) => {
        const option = document.createElement("option");
        option.value = voice.name;
        option.dataset.gender = voice.gender;
        option.dataset.languageCode = voice.languageCode;
        option.dataset.supportedEngine = voice.supportedEngine;
        option.textContent = voice.displayName;
        voiceSelector.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  textInput.addEventListener("input", function (e) {
    if (this.value.length > 3) {
      inputText.value = this.value;
      messageSection.classList.add("hide");
      messageSection.classList.remove("show");
      heroSection.classList.add("show");
      heroSection.classList.remove("hide");
      inputText.focus();
    }
  });

  inputText.addEventListener("input", function () {
    if (this.value.length <= 3) {
      textInput.value = this.value;
      heroSection.classList.add("hide");
      heroSection.classList.remove("show");
      messageSection.classList.remove("hide");
      messageSection.classList.add("show");
      this.value = "";
      textInput.focus();
    }
  });

  convertButton.addEventListener("click", async function (e) {
    e.preventDefault();
    const text = inputText.value;
    const selectedOption = voiceSelector.options[voiceSelector.selectedIndex];
    const selectedVoice = selectedOption.value;
    const selectedGender = selectedOption.dataset.gender;
    const selectedLanguageCode = selectedOption.dataset.languageCode;
    const selectedEngine = selectedOption.dataset.supportedEngine;

    // Realiza una solicitud a tu API personalizada para convertir texto a voz
    // Converting text to speech
    await fetch(`/api/convert`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
        voice: selectedVoice,
        gender: selectedGender,
        languageCode: selectedLanguageCode,
        engine: selectedEngine,
      }),
    })
      .then((res) => res.blob())
      .then((blob) => {
        audioPlayer.src = URL.createObjectURL(blob);
        audioPlayer.play();
        downloadBtnLink.href = audioPlayer.src;
        downloadBtnLink.download = "converted_audio.mp3";
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
});
