let messages = [];
let currentIndex = 0;
let running = false;
let timer = null;
let audioCtx = null;

const messagesBox = document.getElementById("messages");
const intervalPreset = document.getElementById("intervalPreset");
const customDelayRow = document.getElementById("customDelayRow");
const customDelayInput = document.getElementById("customDelay");
const voiceSelect = document.getElementById("voiceSelect");
const fxSelect = document.getElementById("fxSelect");
const browserVoiceSelect = document.getElementById("browserVoice");

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const generateBtn = document.getElementById("generateBtn");
const playBtn = document.getElementById("playBtn");
const copyBtn = document.getElementById("copyBtn");

const status = document.getElementById("status");
const current = document.getElementById("current");
const timerDisplay = document.getElementById("timer");

// ===============================
// AUDIO SYNTH & FX CONTEXT
// ===============================

function initAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playFingerSnap() {
  initAudioContext();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(2400, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.05);

  gain.gain.setValueAtTime(0.6, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.05);
}

// ===============================
// SALVARE & MEMORARE SESIUNE
// ===============================

function saveSession() {
  const sessionData = {
    messages: messagesBox.value,
    intervalPreset: intervalPreset.value,
    customDelay: customDelayInput.value,
    voiceStyle: voiceSelect.value,
    fxStyle: fxSelect.value,
    browserVoice: browserVoiceSelect.value
  };
  localStorage.setItem("dj_mc_session_config", JSON.stringify(sessionData));
}

function loadSession() {
  const saved = localStorage.getItem("dj_mc_session_config");
  if (saved) {
    try {
      const data = JSON.parse(saved);
      if (data.messages !== undefined) messagesBox.value = data.messages;
      if (data.intervalPreset !== undefined) intervalPreset.value = data.intervalPreset;
      if (data.customDelay !== undefined) customDelayInput.value = data.customDelay;
      if (data.voiceStyle !== undefined) voiceSelect.value = data.voiceStyle;
      if (data.fxStyle !== undefined) fxSelect.value = data.fxStyle;
      if (data.browserVoice !== undefined) browserVoiceSelect.value = data.browserVoice;
    } catch(e) {
      console.error("Eroare la încărcarea sesiunii", e);
    }
  }
  updateIntervalUI();
}

// ===============================
// VOCILE DIN BROWSER (TTS)
// ===============================

function populateBrowserVoices() {
  const voices = speechSynthesis.getVoices();
  browserVoiceSelect.innerHTML = "";

  voices.forEach((v) => {
    const opt = document.createElement("option");
    opt.value = v.name;
    opt.textContent = `${v.name} (${v.lang})`;
    if (v.lang.includes("ro")) opt.selected = true;
    browserVoiceSelect.appendChild(opt);
  });
}

speechSynthesis.onvoiceschanged = populateBrowserVoices;

// ===============================
// EVENT LISTENERS & UI
// ===============================

function updateIntervalUI() {
  if (intervalPreset.value === "custom") {
    customDelayRow.style.display = "flex";
  } else {
    customDelayRow.style.display = "none";
  }
}

intervalPreset.addEventListener("change", () => {
  updateIntervalUI();
  saveSession();
});

customDelayInput.addEventListener("input", saveSession);
voiceSelect.addEventListener("change", saveSession);
fxSelect.addEventListener("change", saveSession);
browserVoiceSelect.addEventListener("change", saveSession);
messagesBox.addEventListener("input", saveSession);

window.addEventListener("DOMContentLoaded", () => {
  populateBrowserVoices();
  loadSession();
});

// ===============================
// OBȚINERE TIMP DE PAUZĂ
// ===============================

function getSelectedPauseTime() {
  if (intervalPreset.value === "custom") {
    return parseInt(customDelayInput.value, 10) || 10;
  }
  return parseInt(intervalPreset.value, 10) || 30;
}

// ===============================
// REDARE VOCE CU EFECTE & TIMBRE
// ===============================

function speakMC(text) {
  speechSynthesis.cancel();
  initAudioContext();

  if (fxSelect.value === "snaps") {
    playFingerSnap();
  }

  const speech = new SpeechSynthesisUtterance(text);

  const voices = speechSynthesis.getVoices();
  const matchedVoice = voices.find(v => v.name === browserVoiceSelect.value);
  if (matchedVoice) speech.voice = matchedVoice;
  speech.lang = matchedVoice ? matchedVoice.lang : "ro-RO";

  const style = voiceSelect.value;

  switch(style) {
    case "mc_party":
      speech.rate = 1.15;
      speech.pitch = 1.2;
      speech.volume = 1;
      break;
    case "mc_podcast":
      speech.rate = 0.95;
      speech.pitch = 0.85;
      speech.volume = 0.9;
      break;
    case "mc_radio":
      speech.rate = 1.25;
      speech.pitch = 1.1;
      speech.volume = 1;
      break;
    case "dj_drop":
      speech.rate = 0.85;
      speech.pitch = 0.5;
      speech.volume = 1;
      break;
    case "vader":
      speech.rate = 0.8;
      speech.pitch = 0.1;
      speech.volume = 1;
      break;
    case "minion":
      speech.rate = 1.5;
      speech.pitch = 2.0;
      speech.volume = 1;
      break;
    case "alien":
      speech.rate = 1.1;
      speech.pitch = 1.6;
      speech.volume = 0.95;
      break;
    case "wedding_mc":
      speech.rate = 0.98;
      speech.pitch = 0.95;
      speech.volume = 0.9;
      break;
    case "stadium_mc":
      speech.rate = 1.1;
      speech.pitch = 1.3;
      speech.volume = 1;
      break;
    case "hype_man":
      speech.rate = 1.4;
      speech.pitch = 1.35;
      speech.volume = 1;
      break;
    case "club_mc":
      speech.rate = 1.05;
      speech.pitch = 0.75;
      speech.volume = 1;
      break;
    default:
      speech.rate = 1.05;
      speech.pitch = 1.0;
      speech.volume = 1;
  }

  speechSynthesis.speak(speech);
}

// ===============================
// PAUZĂ PROGRAMABILĂ DINTRE MESAJE
// ===============================

function waitInterval(seconds) {
  return new Promise(resolve => {
    let remaining = seconds;
    timerDisplay.textContent = `⏸ PAUZĂ URMĂTORUL MESAJ: ${remaining}s`;

    timer = setInterval(() => {
      remaining--;

      if (remaining > 0) {
        timerDisplay.textContent = `⏸ PAUZĂ URMĂTORUL MESAJ: ${remaining}s`;
      } else {
        clearInterval(timer);
        timer = null;
        timerDisplay.textContent = "🎤 MC LIVE!";
        resolve();
      }
    }, 1000);
  });
}

// ===============================
// CONTROL RUNNER
// ===============================

function loadMessages() {
  messages = messagesBox.value
    .split("\n")
    .map(text => text.trim())
    .filter(text => text.length > 0);
  return messages;
}

function showMessage(text) {
  current.textContent = text;
  status.textContent = `MC LIVE • Mesaj ${currentIndex + 1} / ${messages.length}`;
}

async function startMC() {
  if (running) return;

  loadMessages();

  if (messages.length === 0) {
    current.textContent = "Scrie mai întâi mesajele MC.";
    return;
  }

  running = true;
  currentIndex = 0;
  status.textContent = "🔥 MC PORNIT & PROGRAMAT";

  while (running && currentIndex < messages.length) {
    const message = messages[currentIndex];

    showMessage(message);
    speakMC(message);

    currentIndex++;

    if (running && currentIndex < messages.length) {
      const delay = getSelectedPauseTime();
      await waitInterval(delay);
    }
  }

  if (running) {
    status.textContent = "✅ TOATE MESAJELE AU FOST REDATE";
    timerDisplay.textContent = "—";
  }

  running = false;
}

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
// BUTOANE DE ACCIUNE
// ===============================

generateBtn.addEventListener("click", () => {
  loadMessages();
  saveSession();
  status.textContent = `🎧 ${messages.length} mesaje pregătite (Pauză: ${getSelectedPauseTime()}s)`;
});

playBtn.addEventListener("click", () => {
  loadMessages();
  if (messages.length === 0) {
    speakMC("Test Voce DJ Hype MC Bot!");
  } else {
    speakMC(messages[0]);
  }
});

copyBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(messagesBox.value);
  status.textContent = "📋 Textele au fost copiate";
});

startBtn.addEventListener("click", startMC);
stopBtn.addEventListener("click", stopMC);
