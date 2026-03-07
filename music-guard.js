(() => {
  const TRACKS_BY_LANG = {
    hi: "melody.webm",
    en: "melody.webm",
    mai: "Sehnai_Dhun_Mangal_Dhun_Music_Mithila_Ke_Lok_Baja_Rasan_Chauki_256kbps.webm",
  };
  const BASE_PATH = "/weddinginvitation/music/";
  const FADE_START_SEC = 49;
  const STOP_SEC = 60;
  const CHECK_INTERVAL_MS = 200;

  let audioEl = null;
  let languageSelect = null;
  let fadeTimer = null;
  let baseVolume = 1;
  let switchingSource = false;

  function desiredTrack() {
    if (!languageSelect) return null;
    return TRACKS_BY_LANG[languageSelect.value] || null;
  }

  function desiredSrc() {
    const track = desiredTrack();
    if (!track) return null;
    return BASE_PATH + encodeURI(track);
  }

  function hasDesiredSrc() {
    if (!audioEl) return true;
    const desired = desiredSrc();
    if (!desired) return true;
    const current = audioEl.getAttribute("src") || "";
    return current.endsWith(desired);
  }

  function setSrcForLanguage(shouldPlay) {
    if (!audioEl) return;
    const desired = desiredSrc();
    if (!desired || hasDesiredSrc()) return;
    switchingSource = true;
    const wasMuted = audioEl.muted;
    audioEl.pause();
    audioEl.src = desired;
    audioEl.load();
    audioEl.muted = wasMuted;
    if (shouldPlay) {
      audioEl
        .play()
        .catch(() => {})
        .finally(() => {
          switchingSource = false;
        });
      return;
    }
    switchingSource = false;
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
    if (!desiredTrack()) {
      stopWithReset();
      return;
    }
    setSrcForLanguage(true);
    audioEl.loop = false;
    baseVolume = audioEl.volume || 1;
    startFadeWatcher();
  }

  function handlePause() {
    resetAudioState();
  }

  function handleLanguageChange() {
    // Do not interrupt a running track if the user switches language.
    // Source will be swapped on the next play.
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
      if (!switchingSource) {
        handlePlay();
      }
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
