// Cosmetic hero terminal widget. This never executes real commands or
// evaluates arbitrary input — it only matches against a small fixed
// whitelist of fake commands and prints canned, pre-written output. Anything
// it displays about the current user/CTF (whoami, system-status) comes from
// `window.init`, which CTFd's base template already populates from the
// server session — never hardcoded demo values.
const TYPE_DELAY_MS = 18;
const LINE_PAUSE_MS = 320;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default function initTerminal() {
  const root = document.getElementById("cyber-terminal");
  if (!root) return;

  const body = root.querySelector(".cyber-terminal-body");
  const input = root.querySelector(".cyber-terminal-input");
  if (!body) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const init = window.init || {};
  const isAuthed = Boolean(init.userId);
  const userLabel = isAuthed ? init.userName || "operator" : "guest";
  const challengesUrl = `${init.urlRoot || ""}/challenges`;
  const registerUrl = `${init.urlRoot || ""}/register`;
  const hostSlug =
    (init.ctfName || "hackverse")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 16) || "hackverse";
  const promptHost = `${userLabel}@${hostSlug}:~$`;

  function addLine(html, className = "") {
    const line = document.createElement("div");
    line.className = `cyber-terminal-line ${className}`.trim();
    line.innerHTML = html;
    body.appendChild(line);
    body.scrollTop = body.scrollHeight;
    return line;
  }

  async function typeLine(prompt, command) {
    const line = addLine(
      `<span class="cyber-terminal-prompt">${prompt}</span> <span class="typed"></span>`,
    );
    const typedEl = line.querySelector(".typed");

    if (prefersReducedMotion) {
      typedEl.textContent = command;
      body.scrollTop = body.scrollHeight;
      return;
    }

    for (let i = 0; i < command.length; i++) {
      typedEl.textContent += command[i];
      body.scrollTop = body.scrollHeight;
      // eslint-disable-next-line no-await-in-loop
      await sleep(TYPE_DELAY_MS);
    }
  }

  const commands = {
    help() {
      addLine(
        "available commands: <b>whoami</b>, <b>system-status</b>, <b>ls</b>, <b>date</b>, <b>clear</b>, <b>./enter_ctf</b>",
        "cyber-terminal-output",
      );
    },
    whoami() {
      addLine(userLabel, "cyber-terminal-output is-ok");
    },
    "system-status"() {
      addLine("[ONLINE]", "cyber-terminal-output is-ok");
    },
    status() {
      commands["system-status"]();
    },
    ls() {
      addLine("challenges/  scoreboard/  profile/  README.md", "cyber-terminal-output");
    },
    date() {
      addLine(new Date().toString(), "cyber-terminal-output");
    },
    clear() {
      body.innerHTML = "";
    },
    "./enter_ctf"() {
      addLine("Access granted...", "cyber-terminal-output is-ok");
      setTimeout(() => {
        window.location.href = isAuthed ? challengesUrl : registerUrl;
      }, 500);
    },
    enter_ctf() {
      commands["./enter_ctf"]();
    },
  };

  async function runIntro() {
    await typeLine(promptHost, "whoami");
    commands.whoami();
    await sleep(LINE_PAUSE_MS);

    await typeLine(promptHost, "system-status");
    commands["system-status"]();
    await sleep(LINE_PAUSE_MS);

    await typeLine(promptHost, "./enter_ctf");
    addLine(
      'type <b>help</b> to see available commands, or run <b>./enter_ctf</b>',
      "cyber-terminal-output",
    );

    if (input) {
      input.disabled = false;
      input.focus({ preventScroll: true });
    }
  }

  if (input) {
    input.disabled = true;
    input.addEventListener("keydown", event => {
      if (event.key !== "Enter") return;
      const value = input.value.trim();
      input.value = "";
      if (!value) return;

      addLine(
        `<span class="cyber-terminal-prompt">${promptHost}</span> ${value}`,
      );

      const handler = commands[value.toLowerCase()];
      if (handler) {
        handler();
      } else {
        addLine(`command not found: ${value}`, "cyber-terminal-output");
      }
    });
  }

  runIntro();
}
