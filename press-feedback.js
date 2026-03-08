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
  let lastVibrateAt = 0;
  let lastPointerVibrateAt = 0;
  let lastPointerType = null;

  function isDisabled(el) {
    if (!el) return true;
    if (el.hasAttribute("disabled")) return true;
    return el.getAttribute("aria-disabled") === "true";
  }

  function vibrateClick() {
    const now = Date.now();
    if (now - lastVibrateAt < 40) return;
    lastVibrateAt = now;

    if (!("vibrate" in navigator)) return;
    navigator.vibrate(15);
  }

  function resolveTarget(event) {
    if (!event) return null;
    const path = typeof event.composedPath === "function" ? event.composedPath() : null;
    if (path && path.length) {
      for (const node of path) {
        if (node instanceof Element) {
          const found = node.closest(SELECTOR);
          if (found) return found;
        }
      }
    }

    const rawTarget = event.target;
    if (rawTarget instanceof Element) {
      return rawTarget.closest(SELECTOR);
    }

    if (rawTarget && rawTarget.parentElement) {
      return rawTarget.parentElement.closest(SELECTOR);
    }

    return null;
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
    const target = resolveTarget(event);
    if (!target || isDisabled(target)) return;
    press(target);
    if (event.pointerType === "touch" || event.pointerType === "pen") {
      lastPointerVibrateAt = Date.now();
      lastPointerType = event.pointerType;
      vibrateClick();
    }
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
    const target = resolveTarget(event);
    if (!target || isDisabled(target)) return;
    press(target);
  }

  function handleKeyUp(event) {
    if (event.key !== "Enter" && event.key !== " ") return;
    const target = resolveTarget(event);
    if (!target || isDisabled(target)) return;
    release(target);
    vibrateClick();
  }

  function handleClick(event) {
    const target = resolveTarget(event);
    if (!target || isDisabled(target)) return;
    if (
      lastPointerType === "touch" &&
      Date.now() - lastPointerVibrateAt < 700
    ) {
      return;
    }
    vibrateClick();
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



