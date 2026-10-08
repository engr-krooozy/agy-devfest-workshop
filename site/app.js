const $ = (selector) => document.querySelector(selector);

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

async function load(name) {
  const response = await fetch(`data/${name}.json?_=${Date.now()}`);
  return response.json();
}

const toMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

function renderHero(event) {
  document.documentElement.style.setProperty("--accent", event.accent);
  $("#brand-name").textContent = event.name;
  $("#hero-eyebrow").textContent = `${event.venue} · ${new Date(event.date).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}`;
  const title = $("#hero-title");
  title.textContent = `${event.name} `;
  title.append(el("span", "", event.city));
  $("#hero-tagline").textContent = event.tagline;
}

function renderCountdown(event) {
  const box = $("#countdown");
  const target = new Date(`${event.date}T09:00:00`).getTime();
  function tick() {
    const left = Math.max(0, target - Date.now());
    const parts = [
      ["Days", Math.floor(left / 86400000)],
      ["Hours", Math.floor(left / 3600000) % 24],
      ["Minutes", Math.floor(left / 60000) % 60],
      ["Seconds", Math.floor(left / 1000) % 60],
    ];
    box.replaceChildren(
      ...parts.map(([label, value]) => {
        const unit = el("div", "unit");
        unit.append(el("span", "num", String(value).padStart(2, "0")), el("span", "label", label));
        return unit;
      })
    );
  }
  tick();
  setInterval(tick, 1000);
}

function renderSpeakers(speakers) {
  const grid = $("#speaker-grid");
  grid.replaceChildren(
    ...speakers.map((speaker) => {
      const card = el("article", "card");
      const initials = speaker.name.split(" ").map((part) => part[0]).join("").slice(0, 2);
      const avatar = el("div", "avatar", initials);
      avatar.style.background = speaker.color;
      card.append(avatar, el("h3", "", speaker.name), el("p", "role", speaker.role), el("p", "topic", speaker.topic));
      return card;
    })
  );
}

function findClashes(sessions) {
  const clashing = new Set();
  sessions.forEach((a, i) => {
    sessions.forEach((b, j) => {
      if (i < j && a.room === b.room && toMinutes(a.time) < toMinutes(b.end) && toMinutes(b.time) < toMinutes(a.end)) {
        clashing.add(a);
        clashing.add(b);
      }
    });
  });
  return clashing;
}

function renderSchedule(schedule, speakers) {
  const days = [...new Set(schedule.map((s) => s.day))].sort();
  const tabs = $("#day-tabs");
  let selected = days[0];

  function draw() {
    tabs.replaceChildren(
      ...(days.length > 1
        ? days.map((day) => {
            const tab = el("button", "tab", `Day ${day}`);
            tab.setAttribute("aria-selected", String(day === selected));
            tab.addEventListener("click", () => { selected = day; draw(); });
            return tab;
          })
        : [])
    );
    const sessions = schedule.filter((s) => s.day === selected).sort((a, b) => toMinutes(a.time) - toMinutes(b.time));
    const clashes = findClashes(sessions);
    $("#timeline").replaceChildren(
      ...sessions.map((session) => {
        const row = el("li", "session" + (clashes.has(session) ? " clash" : ""));
        const speaker = speakers.find((s) => s.id === session.speaker);
        const middle = el("div");
        const title = el("div", "title", session.title);
        if (clashes.has(session)) title.append(el("span", "badge-clash", "⚠ Clash"));
        middle.append(title);
        if (speaker) middle.append(el("div", "who", speaker.name));
        row.append(el("div", "when", `${session.time} – ${session.end}`), middle, el("span", "room", session.room));
        return row;
      })
    );
  }
  draw();
}

function renderFooter() {
  $("#footer").textContent = "© 2026 DevFest Your City · Built live with Antigravity CLI";
}

function initTheme() {
  const root = document.documentElement;
  const button = $("#theme-toggle");
  const saved = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const apply = (theme) => {
    root.dataset.theme = theme;
    button.textContent = theme === "dark" ? "☀️" : "🌙";
  };
  apply(saved || (prefersDark ? "dark" : "light"));
  button.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", next);
    apply(next);
  });
}

async function main() {
  initTheme();
  const [event, speakers, schedule] = await Promise.all([load("event"), load("speakers"), load("schedule")]);
  renderHero(event);
  renderCountdown(event);
  renderSpeakers(speakers);
  renderSchedule(schedule, speakers);
  renderFooter();
}

main();
