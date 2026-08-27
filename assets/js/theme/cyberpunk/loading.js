// One-time boot sequence shown the first time a visitor loads the site in a
// browser session (gated by sessionStorage so it doesn't replay on every
// page navigation in this multi-page CTFd theme — that would violate "keep
// loading short and skippable / do not block users unnecessarily").
const SESSION_KEY = "hv_boot_seen";
const STEPS = [
  "LOADING SECURITY MODULES...",
  "CONNECTING TO CTF SERVER...",
  "AUTHENTICATING PLAYER...",
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default function initLoadingScreen() {
  const screen = document.getElementById("cyber-loading-screen");
  if (!screen) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  let alreadySeen = false;
  try {
    alreadySeen = sessionStorage.getItem(SESSION_KEY) === "1";
  } catch (error) {
    // sessionStorage unavailable (e.g. privacy mode) — treat as not seen
  }

  function hide() {
    screen.classList.add("is-hidden");
    setTimeout(() => screen.remove(), 450);
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch (error) {
      // ignore
    }
  }

  if (alreadySeen || prefersReducedMotion) {
    screen.remove();
    return;
  }

  const fill = screen.querySelector(".cyber-loading-bar-fill");
  const log = screen.querySelector(".cyber-loading-log");

  function skip() {
    hide();
    document.removeEventListener("keydown", onKey);
    screen.removeEventListener("click", skip);
  }

  function onKey(event) {
    if (event.key === "Escape" || event.key === "Enter") skip();
  }

  document.addEventListener("keydown", onKey);
  screen.addEventListener("click", skip);

  (async () => {
    for (let i = 0; i < STEPS.length; i++) {
      if (log) log.textContent = STEPS[i];
      if (fill) fill.style.width = `${((i + 1) / STEPS.length) * 100}%`;
      // eslint-disable-next-line no-await-in-loop
      await sleep(280);
    }
    await sleep(150);
    skip();
  })();

  // Hard cap so a slow tab never blocks the UI for long
  setTimeout(skip, 2500);
}
