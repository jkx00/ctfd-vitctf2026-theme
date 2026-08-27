import initNetworkBackground from "./background";
import initSpotlightEffects from "./spotlight";
import initGlitchText from "./glitch";
import initTerminal from "./terminal";
import initStatCounters from "./counters";
import initLoadingScreen from "./loading";

// Every one of these is purely cosmetic and additive to the page — none of
// them touch CTFd's own Alpine components, forms, or API calls. Each is
// wrapped individually so a failure in one visual effect can never take
// down another, and never blocks core CTFd functionality from working.
function safeRun(fn) {
  try {
    fn();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[cyberpunk-theme]", error);
  }
}

export default function initCyberpunkTheme() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
}

function boot() {
  safeRun(initLoadingScreen);
  safeRun(initNetworkBackground);
  safeRun(initSpotlightEffects);
  safeRun(initGlitchText);
  safeRun(initTerminal);
  safeRun(initStatCounters);
}
