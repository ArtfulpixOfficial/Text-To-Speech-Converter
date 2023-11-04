document.addEventListener("DOMContentLoaded", async function () {
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
      }),
    })
      .then((response) => response.blob())
      .then((blob) => {
        audioPlayer.src = URL.createObjectURL(blob);
        audioPlayer.play();
        downloadBtnLink.href = audioPlayer.src;
        downloadBtnLink.download = "converted_audio.mp3";
        // Download Handler function
        // const downloadHandler = () => {
        //   const url = audioPlayer.src;
        //   const a = document.createElement("a");
        //   downloadBtnLink.href = url;
        //   a.href = url;

        //   // You can change the filename if needed
        //   a.download = "converted_audio.mp3";

        //   a.style.display = "none";
        //   // document.body.appendChild(a);
        //   a.click();
        //   URL.revokeObjectURL(url);
        // };
        // Download Functionality
        // downloadButton.removeEventListener("click", downloadHandler);
        // downloadButton.addEventListener("click", downloadHandler);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
});
