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

// Sunet de Finger Snap / Cue Mark
function playFingerSnap() {
  initAudioContext();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(2400, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.08);

  gain.gain.setValueAtTime(0.8, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.08);
}

// Efect de Reverb / Echo de Stadion
function playBeepFx() {
  initAudioContext();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, audioCtx.currentTime);
  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.15);
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
  const savedVoice = browserVoiceSelect.value;
  browserVoiceSelect.innerHTML = "";

  if (voices.length === 0) return;

  voices.forEach((v) => {
    const opt = document.createElement("option");
    opt.value = v.name;
    opt.textContent = `${v.name} (${v.lang})`;
    if (savedVoice && v.name === savedVoice) {
      opt.selected = true;
    } else if (!savedVoice && v.lang.toLowerCase().includes("ro")) {
      opt.selected = true;
    }
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
  setTimeout(populateBrowserVoices, 500); // Siguranță dublă pentru reîncărcarea vocilor
  loadSession();
});

// ===============================
// OBȚINERE TIMP DE PAUZĂ (10s - 60s / Manual)
// ===============================

function getSelectedPauseTime() {
  if (intervalPreset.value === "custom") {
    const val = parseInt(customDelayInput.value, 10);
    return isNaN(val) ? 10 : val;
  }
  const val = parseInt(intervalPreset.value, 10);
  return isNaN(val) ? 30 : val;
}

// ===============================
// REDARE VOCE CU APLICAREA REALA A PARAMETRILOR
// ===============================

function speakMC(text) {
  speechSynthesis.cancel();
  initAudioContext();

  // Executare Efecte Acustice Adăugate
  if (fxSelect.value === "snaps") {
    playFingerSnap();
  } else if (fxSelect.value === "big_hall") {
    playBeepFx();
  }

  const speech = new SpeechSynthesisUtterance(text);

  // Forțare selectare voce fizică
  const voices = speechSynthesis.getVoices();
  const selectedVoiceName = browserVoiceSelect.value;
  const matchedVoice = voices.find(v => v.name === selectedVoiceName);

  if (matchedVoice) {
    speech.voice = matchedVoice;
    speech.lang = matchedVoice.lang;
  } else {
    speech.lang = "ro-RO";
  }

  // APLICARE SETĂRI DE PITCH ȘI SPEED PENTRU FIECARE STIL MC
  const style = voiceSelect.value;

  switch(style) {
    case "mc_party":
      speech.rate = 1.25;
      speech.pitch = 1.3;
      speech.volume = 1;
      break;
    case "mc_podcast":
      speech.rate = 0.9;
      speech.pitch = 0.75;
      speech.volume = 0.95;
      break;
    case "mc_radio":
      speech.rate = 1.35;
      speech.pitch = 1.15;
      speech.volume = 1;
      break;
    case "dj_drop":
      speech.rate = 0.8;
      speech.pitch = 0.3;
      speech.volume = 1;
      break;
    case "vader":
      speech.rate = 0.75;
      speech.pitch = 0.1;
      speech.volume = 1;
      break;
    case "minion":
      speech.rate = 1.6;
      speech.pitch = 2.0;
      speech.volume = 1;
      break;
    case "alien":
      speech.rate = 1.1;
      speech.pitch = 1.7;
      speech.volume = 0.9;
      break;
    case "wedding_mc":
      speech.rate = 0.95;
      speech.pitch = 0.9;
      speech.volume = 0.95;
      break;
    case "stadium_mc":
      speech.rate = 1.15;
      speech.pitch = 1.4;
      speech.volume = 1;
      break;
    case "hype_man":
      speech.rate = 1.5;
      speech.pitch = 1.4;
      speech.volume = 1;
      break;
    case "club_mc":
      speech.rate = 1.0;
      speech.pitch = 0.6;
      speech.volume = 1;
      break;
    default:
      speech.rate = 1.0;
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

    // Aici se aplică timpul din interfață (10s, 30s, 60s sau manual)
    if (running && currentIndex < messages.length) {
      const delaySeconds = getSelectedPauseTime();
      await waitInterval(delaySeconds);
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
// BUTOANE DE ACȚIUNE
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
