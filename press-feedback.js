(() => {
  const SELECTOR = [
    "button",
    "a",
    "[role=\"button\"]",
    "input[type=\"button\"]",
    "input[type=\"submit\"]",
    ".btn",
    ".chip",
    ".photo-card",
    ".topbar-plain-btn",
    ".notify-bell",
    ".topbar-notify-btn",
    ".quick-nav-toggle",
    ".quick-nav-panel button",
    ".chat-fab",
    ".chat-link-btn",
    ".chat-external-btn",
    ".chat-prompts button",
    ".chat-language-options button",
    ".chat-venue-options button",
    ".chat-confirm-action button",
    ".chat-input button",
    ".chat-close"
  ].join(",");

  const PRESSABLE_CLASS = "pressable";
  const PRESSED_CLASS = "is-pressed";
  const RELEASE_CLASS = "is-released";
  const RELEASE_MS = 190;

  let activeEl = null;
  let audioCtx = null;
  let lastSoundAt = 0;

  function isDisabled(el) {
    if (!el) return true;
    if (el.hasAttribute("disabled")) return true;
    return el.getAttribute("aria-disabled") === "true";
  }

  function prefersSound() {
    const icon = document.querySelector(".music-mode-icon");
    if (!icon) return true;
    return icon.classList.contains("is-on");
  }

  function playClick() {
    const now = Date.now();
    if (now - lastSoundAt < 40) return;
    lastSoundAt = now;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    if (!audioCtx) {
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const t = audioCtx.currentTime;

    osc.type = "triangle";
    osc.frequency.setValueAtTime(520, t);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.05, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(t);
    osc.stop(t + 0.085);
  }

  function markPressables(root) {
    if (!root) return;
    root.querySelectorAll(SELECTOR).forEach((el) => {
      if (!el.classList.contains(PRESSABLE_CLASS)) {
        el.classList.add(PRESSABLE_CLASS);
      }
    });
  }

  function press(el) {
    if (!el || isDisabled(el)) return;
    activeEl = el;
    el.classList.add(PRESSED_CLASS);
    el.classList.remove(RELEASE_CLASS);
  }

  function release(el) {
    if (!el) return;
    el.classList.remove(PRESSED_CLASS);
    el.classList.add(RELEASE_CLASS);
    window.setTimeout(() => {
      el.classList.remove(RELEASE_CLASS);
    }, RELEASE_MS);
  }

  function handlePointerDown(event) {
    const target = event.target.closest(SELECTOR);
    if (!target || isDisabled(target)) return;
    press(target);
  }

  function handlePointerUp() {
    if (!activeEl) return;
    const el = activeEl;
    activeEl = null;
    release(el);
  }

  function handlePointerCancel() {
    if (!activeEl) return;
    const el = activeEl;
    activeEl = null;
    release(el);
  }

  function handleKeyDown(event) {
    if (event.key !== "Enter" && event.key !== " ") return;
    const target = event.target.closest(SELECTOR);
    if (!target || isDisabled(target)) return;
    press(target);
  }

  function handleKeyUp(event) {
    if (event.key !== "Enter" && event.key !== " ") return;
    const target = event.target.closest(SELECTOR);
    if (!target || isDisabled(target)) return;
    release(target);
  }

  function handleClick(event) {
    const target = event.target.closest(SELECTOR);
    if (!target || isDisabled(target)) return;
    if (!prefersSound()) return;
    playClick();
  }

  document.addEventListener("pointerdown", handlePointerDown, { passive: true });
  document.addEventListener("pointerup", handlePointerUp, { passive: true });
  document.addEventListener("pointercancel", handlePointerCancel, { passive: true });
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);
  document.addEventListener("click", handleClick, { passive: true });

  const observer = new MutationObserver(() => markPressables(document));
  observer.observe(document.documentElement, { childList: true, subtree: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => markPressables(document));
  } else {
    markPressables(document);
  }
})();

