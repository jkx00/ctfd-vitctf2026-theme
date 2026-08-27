// Cursor spotlight (radial glow that follows the pointer) + magnetic
// tilt/border-glow for cards marked with `.tilt-card`. Both effects are
// mouse-driven, throttled to rAF, and fully disabled under
// prefers-reduced-motion or on touch/coarse-pointer devices.
export default function initSpotlightEffects() {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const isCoarsePointer = window.matchMedia("(hover: none)").matches;

  if (prefersReducedMotion || isCoarsePointer) return;

  const spotlight = document.querySelector(".cyber-spotlight");

  let pending = false;
  let lastX = 0;
  let lastY = 0;
  let hoveredCard = null;

  function updateSpotlight() {
    if (spotlight) {
      spotlight.style.setProperty("--spot-x", `${lastX}px`);
      spotlight.style.setProperty("--spot-y", `${lastY}px`);
      spotlight.classList.add("is-active");
    }

    if (hoveredCard) {
      const rect = hoveredCard.getBoundingClientRect();
      const px = lastX - rect.left;
      const py = lastY - rect.top;
      const relX = (px / rect.width) * 100;
      const relY = (py / rect.height) * 100;

      hoveredCard.style.setProperty("--card-x", `${relX}%`);
      hoveredCard.style.setProperty("--card-y", `${relY}%`);

      const rotateY = ((px / rect.width) - 0.5) * 6;
      const rotateX = -((py / rect.height) - 0.5) * 6;
      hoveredCard.style.setProperty("--tilt-x", `${rotateX}deg`);
      hoveredCard.style.setProperty("--tilt-y", `${rotateY}deg`);
    }

    pending = false;
  }

  function onPointerMove(event) {
    lastX = event.clientX;
    lastY = event.clientY;

    if (!pending) {
      pending = true;
      requestAnimationFrame(updateSpotlight);
    }
  }

  window.addEventListener("pointermove", onPointerMove, { passive: true });

  document.addEventListener(
    "pointerover",
    event => {
      const card = event.target.closest(".tilt-card");
      if (card) hoveredCard = card;
    },
    true,
  );

  document.addEventListener(
    "pointerout",
    event => {
      const card = event.target.closest(".tilt-card");
      if (card && card === hoveredCard) {
        card.style.setProperty("--tilt-x", "0deg");
        card.style.setProperty("--tilt-y", "0deg");
        hoveredCard = null;
      }
    },
    true,
  );
}
