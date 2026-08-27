// Animated stat tiles driven entirely by live CTFd API data — no hardcoded
// demo numbers. Each `[data-stat]` element is populated once the relevant
// endpoint resolves, then counted up from 0 when it scrolls into view.
async function fetchJson(url) {
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      credentials: "same-origin",
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    return null;
  }
}

function animateCount(el, target) {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (prefersReducedMotion || !Number.isFinite(target)) {
    el.textContent = Number.isFinite(target) ? target.toLocaleString() : "—";
    return;
  }

  const duration = 1200;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

async function resolveStat(kind, urlRoot, userMode) {
  switch (kind) {
    case "challenges": {
      const data = await fetchJson(`${urlRoot}/api/v1/challenges`);
      return data && data.success ? data.data.length : null;
    }
    case "players": {
      const endpoint = userMode === "teams" ? "teams" : "users";
      const data = await fetchJson(`${urlRoot}/api/v1/${endpoint}?page=1`);
      if (data && data.success && data.meta && data.meta.pagination) {
        return data.meta.pagination.total;
      }
      return null;
    }
    case "solves": {
      const data = await fetchJson(`${urlRoot}/api/v1/scoreboard/top/100`);
      if (!data || !data.success) return null;
      let total = 0;
      Object.values(data.data).forEach(team => {
        if (Array.isArray(team.solves)) {
          total += team.solves.filter(s => s.challenge_id !== null).length;
        }
      });
      return total;
    }
    default:
      return null;
  }
}

export default function initStatCounters() {
  const tiles = document.querySelectorAll("[data-stat]");
  if (!tiles.length) return;

  const init = window.init || {};
  const urlRoot = init.urlRoot || "";
  const userMode = init.userMode || "users";

  const observer =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          entries => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                const valueEl = entry.target.querySelector(".stat-tile-value");
                const target = Number(entry.target.dataset.resolvedValue);
                if (valueEl && Number.isFinite(target)) {
                  animateCount(valueEl, target);
                }
                observer.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.3 },
        )
      : null;

  tiles.forEach(async tile => {
    const kind = tile.getAttribute("data-stat");
    const valueEl = tile.querySelector(".stat-tile-value");
    if (!valueEl) return;

    const value = await resolveStat(kind, urlRoot, userMode);

    if (value === null) {
      valueEl.textContent = "—";
      return;
    }

    tile.dataset.resolvedValue = String(value);

    if (observer) {
      observer.observe(tile);
    } else {
      animateCount(valueEl, value);
    }
  });
}
