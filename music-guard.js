(() => {
  const ALLOWED_LANGS = new Set(["hi", "en"]);
  const FADE_START_SEC = 49;
  const STOP_SEC = 60;
  const CHECK_INTERVAL_MS = 200;

  let audioEl = null;
  let languageSelect = null;
  let fadeTimer = null;
  let baseVolume = 1;
  let playbackAllowed = false;

  function allowedLanguage() {
    if (!languageSelect) {
      return true;
    }
    return ALLOWED_LANGS.has(languageSelect.value);
  }

  function resetAudioState() {
    if (!audioEl) return;
    audioEl.volume = baseVolume;
  }

  function stopWithReset() {
    if (!audioEl) return;
    audioEl.pause();
    audioEl.currentTime = 0;
    resetAudioState();
    playbackAllowed = false;
  }

  function startFadeWatcher() {
    if (fadeTimer) {
      clearInterval(fadeTimer);
    }
    fadeTimer = setInterval(() => {
      if (!audioEl) return;
      const t = audioEl.currentTime || 0;
      if (t >= STOP_SEC) {
        stopWithReset();
        return;
      }
      if (t >= FADE_START_SEC) {
        if (audioEl.muted) return;
        const remaining = STOP_SEC - t;
        const fadeWindow = STOP_SEC - FADE_START_SEC;
        const ratio = Math.max(0, remaining / fadeWindow);
        audioEl.volume = baseVolume * ratio;
      } else {
        if (!audioEl.muted) {
          audioEl.volume = baseVolume;
        }
      }
    }, CHECK_INTERVAL_MS);
  }

  function handlePlay() {
    if (!allowedLanguage()) {
      stopWithReset();
      return;
    }
    audioEl.loop = false;
    baseVolume = audioEl.volume || 1;
    playbackAllowed = true;
    startFadeWatcher();
  }

  function handlePause() {
    resetAudioState();
  }

  function handleLanguageChange() {
    // Do not interrupt a running track if the user switches language.
    // Language gate applies only at play-start.
  }

  function bindElements() {
    const newAudio = document.querySelector("audio");
    const newSelect = document.getElementById("language-select");

    if (newAudio && newAudio !== audioEl) {
      if (audioEl) {
        audioEl.removeEventListener("play", handlePlay);
        audioEl.removeEventListener("pause", handlePause);
      }
      audioEl = newAudio;
      audioEl.addEventListener("play", handlePlay);
      audioEl.addEventListener("pause", handlePause);
    }

    if (newSelect && newSelect !== languageSelect) {
      if (languageSelect) {
        languageSelect.removeEventListener("change", handleLanguageChange);
      }
      languageSelect = newSelect;
      languageSelect.addEventListener("change", handleLanguageChange);
    }

    if (audioEl && !audioEl.paused) {
      handlePlay();
    }
  }

  const observer = new MutationObserver(bindElements);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindElements);
  } else {
    bindElements();
  }
})();
