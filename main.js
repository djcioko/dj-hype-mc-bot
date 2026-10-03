let messages = [];
let currentIndex = 0;
let running = false;
let timer = null;

const PAUSE_TIME = 3000;

const messagesBox = document.getElementById("messages");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const generateBtn = document.getElementById("generateBtn");
const playBtn = document.getElementById("playBtn");
const copyBtn = document.getElementById("copyBtn");

const status = document.getElementById("status");
const current = document.getElementById("current");
const timerDisplay = document.getElementById("timer");

// ===============================
// SALVARE/RESTAURARE MESAJ
// ===============================

// Încarcă mesajele salvate anterior când repornești/reîncarci aplicația
window.addEventListener("DOMContentLoaded", () => {
  const savedMessages = localStorage.getItem("dj_hype_messages");
  if (savedMessages) {
    messagesBox.value = savedMessages;
  }
});

// Salvează mesajele în timp ce le tastezi
messagesBox.addEventListener("input", () => {
  localStorage.setItem("dj_hype_messages", messagesBox.value);
});


// ===============================
// CITIRE MESAJE
// ===============================

function loadMessages() {
  messages = messagesBox.value
    .split("\n")
    .map(text => text.trim())
    .filter(text => text.length > 0);

  return messages;
}


// ===============================
// AFIȘEAZĂ MESAJUL
// ===============================

function showMessage(text) {
  current.textContent = text;
  status.textContent = `MC LIVE • Mesaj ${currentIndex + 1} / ${messages.length}`;
}


// ===============================
// PAUZĂ EXACTĂ DE 3 SECUNDE
// ===============================

function waitThreeSeconds() {
  return new Promise(resolve => {
    let remaining = 3;
    timerDisplay.textContent = `⏸ PAUZĂ ${remaining}`;

    timer = setInterval(() => {
      remaining--;

      if (remaining > 0) {
        timerDisplay.textContent = `⏸ PAUZĂ ${remaining}`;
      } else {
        clearInterval(timer);
        timer = null;
        timerDisplay.textContent = "🎤 MC";
        resolve();
      }
    }, 1000);
  });
}


// ===============================
// PORNEȘTE MC
// ===============================

async function startMC() {
  if (running) return;

  loadMessages();

  if (messages.length === 0) {
    current.textContent = "Scrie mai întâi mesajele MC.";
    return;
  }

  running = true;
  currentIndex = 0;
  status.textContent = "🔥 MC PORNIT";

  while (running && currentIndex < messages.length) {
    const message = messages[currentIndex];

    showMessage(message);
    speakMC(message);

    currentIndex++;

    if (running && currentIndex < messages.length) {
      await waitThreeSeconds();
    }
  }

  if (running) {
    status.textContent = "✅ TOATE MESAJELE AU FOST REDATE";
    timerDisplay.textContent = "—";
  }

  running = false;
}


// ===============================
// STOP
// ===============================

function stopMC() {
  running = false;

  if (timer) {
    clearInterval(timer);
    timer = null;
  }

  speechSynthesis.cancel();
  status.textContent = "⛔ MC OPRIT";
  timerDisplay.textContent = "—";
}


// ===============================
// VOCE MC
// ===============================

function speakMC(text) {
  speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "ro-RO";
  speech.rate = 1.05;
  speech.pitch = 1.05;
  speech.volume = 1;

  speechSynthesis.speak(speech);
}


// ===============================
// EVENT LISTENERS
// ===============================

generateBtn.addEventListener("click", () => {
  loadMessages();
  status.textContent = `🎧 ${messages.length} mesaje pregătite pentru MC`;
});

playBtn.addEventListener("click", () => {
  loadMessages();
  if (messages.length === 0) return;
  speakMC(messages[0]);
});

copyBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(messagesBox.value);
  status.textContent = "📋 Textele au fost copiate";
});

startBtn.addEventListener("click", startMC);
stopBtn.addEventListener("click", stopMC);
