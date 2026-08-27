// Sparing glitch-on-hover/entrance effect for elements marked [data-glitch].
// Toggles a CSS animation class rather than mutating text, so it never
// touches the underlying (translated) heading content.
export default function initGlitchText() {
  const targets = document.querySelectorAll("[data-glitch]");
  if (!targets.length) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  targets.forEach(el => {
    if (!el.hasAttribute("data-text")) {
      el.setAttribute("data-text", el.textContent);
    }
    el.classList.add("glitch-text");

    if (prefersReducedMotion) return;

    const trigger = () => {
      el.classList.remove("is-glitching");
      // Force reflow so the animation can restart on repeated triggers
      void el.offsetWidth;
      el.classList.add("is-glitching");
    };

    el.addEventListener("mouseenter", trigger);

    // One-off entrance glitch shortly after the element becomes visible
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setTimeout(trigger, 300);
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 },
      );
      io.observe(el);
    }
  });
}
