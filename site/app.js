const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

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

/* 1. Theme Engine */
function initTheme() {
  const toggle = $("#theme-toggle");
  const saved = localStorage.getItem("theme");
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  let dark = saved ? saved === "dark" : prefersDark;

  function apply() {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    if (toggle) {
      toggle.textContent = dark ? "☀️" : "🌙";
      toggle.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
      toggle.setAttribute("aria-pressed", String(dark));
    }
  }

  if (toggle) {
    toggle.addEventListener("click", () => {
      dark = !dark;
      localStorage.setItem("theme", dark ? "dark" : "light");
      apply();
    });
  }
  apply();
}

/* 2. Hero, Stats, Venue & Single Source of Truth */
function renderHero(event) {
  document.documentElement.style.setProperty("--accent", event.accent);
  document.title = `${event.name} ${event.city} ${event.year}`;
  const metaDesc = $("#meta-description");
  if (metaDesc) {
    metaDesc.setAttribute("content", `${event.name} ${event.city} ${event.year}: ${event.tagline}`);
  }
  $("#brand-name").textContent = `${event.name} ${event.city}`;
  const startFormatted = new Date(event.date).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
  $("#hero-eyebrow").textContent = `${event.venue} · ${startFormatted}`;
  const title = $("#hero-title");
  title.textContent = `${event.name} `;
  title.append(el("span", "", event.city));
  $("#hero-tagline").textContent = event.tagline;

  const badgeBrand = $("#badge-event-brand");
  if (badgeBrand) badgeBrand.textContent = `${event.name} ${event.year}`;
  const badgeMeta = $("#badge-event-meta");
  if (badgeMeta) badgeMeta.textContent = `${event.city} · ${event.venue}`;

  const statsContainer = $("#stats-container");
  if (statsContainer && Array.isArray(event.stats)) {
    statsContainer.replaceChildren(
      ...event.stats.map((s) => {
        const card = el("div", "stat-card");
        card.append(el("div", "stat-value", s.value), el("div", "stat-label", s.label));
        return card;
      })
    );
  }

  const venueContainer = $("#venue-container");
  if (venueContainer && event.venueDetails) {
    const info = el("div", "venue-info");
    info.append(
      el("h3", "", `${event.venue} (${event.city})`),
      el("p", "", `📍 Address: ${event.venueDetails.address}`),
      el("p", "", `🚌 Transit & Parking: ${event.venueDetails.transit}`),
      el("p", "", `♿ Accessibility: ${event.venueDetails.accessibility}`)
    );
    if (event.venueDetails.mapUrl) {
      const mapLink = el("a", "btn btn-sm btn-outline", "Open in Google Maps");
      mapLink.href = event.venueDetails.mapUrl;
      mapLink.target = "_blank";
      mapLink.rel = "noopener noreferrer";
      info.append(mapLink);
    }
    venueContainer.replaceChildren(info);
  }
}

/* 3. Countdown Timer */
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

/* 4. Clash Detection (Room & Personal Agenda) */
function findClashes(sessions) {
  const clashing = new Set();
  sessions.forEach((a, i) => {
    sessions.forEach((b, j) => {
      if (
        i < j &&
        a.day === b.day &&
        a.room === b.room &&
        toMinutes(a.time) < toMinutes(b.end) &&
        toMinutes(b.time) < toMinutes(a.end)
      ) {
        clashing.add(a);
        clashing.add(b);
      }
    });
  });
  return clashing;
}

function findPersonalClashes(savedSessions) {
  const conflicts = new Set();
  savedSessions.forEach((a, i) => {
    savedSessions.forEach((b, j) => {
      if (
        i < j &&
        a.day === b.day &&
        toMinutes(a.time) < toMinutes(b.end) &&
        toMinutes(b.time) < toMinutes(a.end)
      ) {
        conflicts.add(a.title);
        conflicts.add(b.title);
      }
    });
  });
  return conflicts;
}

/* 5. RFC 5545 .ics Calendar Generator */
function formatIcsDate(dateStr, timeStr) {
  const [hours, minutes] = timeStr.split(":");
  const d = dateStr.replace(/-/g, "");
  return `${d}T${hours}${minutes}00`;
}

function foldLine(line) {
  if (line.length <= 75) return line;
  let folded = "";
  let remainder = line;
  while (remainder.length > 75) {
    folded += remainder.slice(0, 75) + "\r\n ";
    remainder = remainder.slice(75);
  }
  folded += remainder;
  return folded;
}

function generateIcs(sessions, event) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//DevFest//DevFest Event Schedule//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH"
  ];

  sessions.forEach((s) => {
    const sessionDate = s.day === 2 ? (event.endDate || "2026-11-15") : event.date;
    const dtStart = formatIcsDate(sessionDate, s.time);
    const dtEnd = formatIcsDate(sessionDate, s.end);
    const uid = `devfest-${s.day}-${s.time.replace(":", "")}-${s.room.replace(/\s+/g, "")}@devfest`;

    lines.push(
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${formatIcsDate(event.date, "00:00")}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      foldLine(`SUMMARY:${s.title}`),
      foldLine(`DESCRIPTION:${s.abstract || s.title}`),
      foldLine(`LOCATION:${s.room}, ${event.venue}`),
      "END:VEVENT"
    );
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

function downloadIcsBlob(content, filename) {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* 6. Accessible Modal Dialog Manager (WCAG 2.1 AA) */
const Modal = {
  container: $("#modal-container"),
  body: $("#modal-body"),
  card: $("#modal-card"),
  closeBtn: $("#modal-close"),
  opener: null,

  open(contentNode, openerElement) {
    if (!this.container) return;
    this.opener = openerElement || document.activeElement;
    this.body.replaceChildren(contentNode);
    this.container.style.display = "flex";
    this.container.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    if (this.closeBtn) this.closeBtn.focus();

    this.keyHandler = (e) => {
      if (e.key === "Escape") {
        this.close();
        return;
      }
      if (e.key === "Tab") {
        const focusables = this.container.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", this.keyHandler);
  },

  close() {
    if (!this.container) return;
    this.container.style.display = "none";
    this.container.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (this.keyHandler) {
      document.removeEventListener("keydown", this.keyHandler);
    }
    if (this.opener && typeof this.opener.focus === "function") {
      this.opener.focus();
    }
  },

  init() {
    if (this.closeBtn) this.closeBtn.addEventListener("click", () => this.close());
    const backdrop = $("#modal-backdrop");
    if (backdrop) backdrop.addEventListener("click", () => this.close());
  }
};

/* 7. Speakers & Multi-Facet Schedule Engine */
function renderSpeakersAndSchedule(speakers, schedule, event) {
  const grid = $("#speaker-grid");
  const hint = $("#speaker-hint");
  const days = [...new Set(schedule.map((s) => s.day))].sort((a, b) => a - b);
  const rooms = ["All rooms", ...new Set(schedule.map((s) => s.room))];
  const tracks = ["All tracks", ...new Set(schedule.map((s) => s.track).filter(Boolean))];
  const levels = ["All levels", ...new Set(schedule.map((s) => s.level).filter(Boolean))];

  const tabs = $("#day-tabs");
  const roomFilters = $("#room-filters");
  const searchInput = $("#schedule-search");
  const trackSelect = $("#track-filter");
  const levelSelect = $("#level-filter");
  const speakerSelect = $("#speaker-filter");
  const conflictBanner = $("#agenda-conflict-banner");

  let selectedDay = days[0];
  let selectedRoom = "All rooms";
  let selectedTrack = "All tracks";
  let selectedLevel = "All levels";
  let selectedSpeaker = null;
  let searchQuery = "";
  let showMyAgendaOnly = false;

  const savedAgendaKey = "devfest_saved_agenda";
  let savedTitles = new Set(JSON.parse(localStorage.getItem(savedAgendaKey) || "[]"));

  if (trackSelect) {
    trackSelect.replaceChildren(
      ...tracks.map((t) => {
        const opt = el("option", "", t);
        opt.value = t;
        return opt;
      })
    );
    trackSelect.addEventListener("change", () => {
      selectedTrack = trackSelect.value;
      drawSchedule();
    });
  }

  if (levelSelect) {
    levelSelect.replaceChildren(
      ...levels.map((l) => {
        const opt = el("option", "", l);
        opt.value = l;
        return opt;
      })
    );
    levelSelect.addEventListener("change", () => {
      selectedLevel = levelSelect.value;
      drawSchedule();
    });
  }

  if (speakerSelect) {
    speakerSelect.replaceChildren(
      el("option", "", "All speakers"),
      ...speakers.map((sp) => {
        const opt = el("option", "", sp.name);
        opt.value = sp.id;
        return opt;
      })
    );
    speakerSelect.firstChild.value = "All speakers";
    speakerSelect.addEventListener("change", () => {
      selectedSpeaker = speakerSelect.value === "All speakers" ? null : speakerSelect.value;
      drawSpeakers();
      drawSchedule();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      searchQuery = searchInput.value.trim().toLowerCase();
      drawSchedule();
    });
  }

  function updateSavedState() {
    localStorage.setItem(savedAgendaKey, JSON.stringify([...savedTitles]));
    const badge = $("#saved-count");
    if (badge) badge.textContent = savedTitles.size;

    const savedSessions = schedule.filter((s) => savedTitles.has(s.title));
    const personalClashes = findPersonalClashes(savedSessions);
    if (conflictBanner) {
      if (personalClashes.size > 0) {
        conflictBanner.textContent = `⚠ Personal Agenda Conflict: ${[...personalClashes].join(" & ")} overlap in your saved schedule.`;
        conflictBanner.style.display = "block";
      } else {
        conflictBanner.style.display = "none";
      }
    }
    return personalClashes;
  }

  const myAgendaBtn = $("#my-agenda-btn");
  if (myAgendaBtn) {
    myAgendaBtn.addEventListener("click", () => {
      showMyAgendaOnly = !showMyAgendaOnly;
      myAgendaBtn.setAttribute("aria-pressed", String(showMyAgendaOnly));
      myAgendaBtn.classList.toggle("btn-primary", showMyAgendaOnly);
      myAgendaBtn.classList.toggle("btn-outline", !showMyAgendaOnly);
      drawSchedule();
    });
  }

  const exportIcsBtn = $("#export-ics-btn");
  if (exportIcsBtn) {
    exportIcsBtn.addEventListener("click", () => {
      const savedList = schedule.filter((s) => savedTitles.has(s.title));
      const exportList = showMyAgendaOnly && savedList.length > 0 ? savedList : (savedList.length > 0 ? savedList : schedule);
      const ics = generateIcs(exportList, event);
      downloadIcsBlob(ics, savedList.length > 0 ? "my-devfest-agenda.ics" : "devfest-schedule.ics");
    });
  }

  function showSpeakerModal(speaker, opener) {
    const content = el("div", "speaker-modal-content");
    const avatar = el("div", "avatar", speaker.name.split(" ").map((n) => n[0]).join("").slice(0, 2));
    avatar.style.background = speaker.color;
    avatar.style.width = "72px";
    avatar.style.height = "72px";
    avatar.style.fontSize = "1.5rem";

    const heading = el("h2", "", speaker.name);
    heading.id = "modal-title";

    content.append(
      avatar,
      heading,
      el("p", "role", `${speaker.role}${speaker.company ? " · " + speaker.company : ""}`),
      el("p", "topic", `Key Topic: ${speaker.topic}`),
      el("p", "bio", speaker.bio || "Featured speaker at DevFest.")
    );

    if (speaker.social) {
      const socials = el("div", "social-links");
      Object.entries(speaker.social).forEach(([platform, url]) => {
        const a = el("a", "", platform.charAt(0).toUpperCase() + platform.slice(1));
        a.href = url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        socials.append(a);
      });
      content.append(socials);
    }

    const talks = schedule.filter((s) => s.speaker === speaker.id);
    if (talks.length) {
      content.append(el("h4", "", "Conference Sessions:"));
      const list = el("ul", "");
      talks.forEach((t) => {
        list.append(el("li", "", `Day ${t.day} · ${t.time}–${t.end} (${t.room}): ${t.title}`));
      });
      content.append(list);
    }

    const filterBtn = el("button", "btn btn-sm btn-primary", selectedSpeaker === speaker.id ? "Clear Speaker Filter" : `Filter Schedule by ${speaker.name}`);
    filterBtn.addEventListener("click", () => {
      selectedSpeaker = selectedSpeaker === speaker.id ? null : speaker.id;
      if (speakerSelect) speakerSelect.value = selectedSpeaker || "All speakers";
      if (selectedSpeaker && talks[0]) selectedDay = talks[0].day;
      drawSpeakers();
      drawSchedule();
      Modal.close();
      $("#schedule").scrollIntoView({ behavior: "smooth" });
    });
    content.append(filterBtn);
    Modal.open(content, opener);
  }

  function showSessionModal(session, opener) {
    const content = el("div", "session-modal-content");
    const sp = speakers.find((s) => s.id === session.speaker);
    const heading = el("h2", "", session.title);
    heading.id = "modal-title";

    content.append(
      heading,
      el("p", "when", `Day ${session.day} · ${session.time} – ${session.end} · ${session.room}`)
    );
    if (session.track || session.level) {
      const badges = el("div", "meta-badges");
      if (session.track) badges.append(el("span", "meta-pill", session.track));
      if (session.level) badges.append(el("span", "meta-pill", session.level));
      content.append(badges);
    }
    if (sp) {
      content.append(el("p", "who", `Speaker: ${sp.name} (${sp.role}${sp.company ? ", " + sp.company : ""})`));
    }
    content.append(el("p", "abstract", session.abstract || "Join this session at DevFest for practical insights and live demos."));

    const actions = el("div", "hero-actions");
    const bookmarkBtn = el("button", "btn btn-sm btn-primary", savedTitles.has(session.title) ? "★ Remove from My Agenda" : "☆ Save to My Agenda");
    bookmarkBtn.addEventListener("click", () => {
      if (savedTitles.has(session.title)) {
        savedTitles.delete(session.title);
      } else {
        savedTitles.add(session.title);
      }
      updateSavedState();
      drawSchedule();
      Modal.close();
    });

    const singleIcsBtn = el("button", "btn btn-sm btn-outline", "📅 Export Session (.ics)");
    singleIcsBtn.addEventListener("click", () => {
      const ics = generateIcs([session], event);
      downloadIcsBlob(ics, `${session.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.ics`);
    });

    actions.append(bookmarkBtn, singleIcsBtn);
    content.append(actions);
    Modal.open(content, opener);
  }

  function drawSpeakers() {
    if (hint) {
      const active = speakers.find((s) => s.id === selectedSpeaker);
      hint.textContent = active
        ? `Filtering schedule by ${active.name}`
        : "Click a speaker card for their full biography and session details";
    }
    grid.replaceChildren(
      ...speakers.map((speaker) => {
        const isSelected = speaker.id === selectedSpeaker;
        const card = el("article", "card" + (isSelected ? " active" : ""));
        card.setAttribute("role", "button");
        card.setAttribute("tabindex", "0");
        card.setAttribute("aria-label", `${speaker.name}, ${speaker.role}. Click for bio and sessions.`);
        const initials = speaker.name.split(" ").map((part) => part[0]).join("").slice(0, 2);
        const avatar = el("div", "avatar", initials);
        avatar.style.background = speaker.color;

        card.append(
          avatar,
          el("h3", "", speaker.name),
          speaker.company ? el("div", "company", speaker.company) : "",
          el("p", "role", speaker.role),
          el("p", "topic", speaker.topic)
        );

        if (Array.isArray(speaker.tags)) {
          const tagRow = el("div", "card-tags");
          speaker.tags.forEach((t) => tagRow.append(el("span", "card-tag", t)));
          card.append(tagRow);
        }

        card.addEventListener("click", () => showSpeakerModal(speaker, card));
        card.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            showSpeakerModal(speaker, card);
          }
        });
        return card;
      })
    );
  }

  function drawSchedule() {
    const personalClashes = updateSavedState();

    tabs.replaceChildren(
      ...(days.length > 1
        ? days.map((day) => {
            const tab = el("button", "tab", `Day ${day}`);
            tab.setAttribute("role", "tab");
            tab.setAttribute("aria-selected", String(day === selectedDay));
            tab.addEventListener("click", () => {
              selectedDay = day;
              drawSchedule();
            });
            return tab;
          })
        : [])
    );

    if (roomFilters) {
      roomFilters.replaceChildren(
        ...rooms.map((room) => {
          const pill = el("button", "room-pill", room);
          pill.setAttribute("aria-pressed", String(room === selectedRoom));
          pill.addEventListener("click", () => {
            selectedRoom = room;
            drawSchedule();
          });
          return pill;
        })
      );
    }

    const daySessions = schedule
      .filter((s) => s.day === selectedDay)
      .sort((a, b) => toMinutes(a.time) - toMinutes(b.time));
    const clashes = findClashes(daySessions);

    const filtered = daySessions.filter((s) => {
      if (showMyAgendaOnly && !savedTitles.has(s.title)) return false;
      if (selectedRoom !== "All rooms" && s.room !== selectedRoom) return false;
      if (selectedTrack !== "All tracks" && s.track !== selectedTrack) return false;
      if (selectedLevel !== "All levels" && s.level !== selectedLevel) return false;
      if (selectedSpeaker && s.speaker !== selectedSpeaker) return false;
      if (searchQuery) {
        const sp = speakers.find((x) => x.id === s.speaker);
        const haystack = `${s.title} ${s.abstract || ""} ${s.track || ""} ${s.room} ${sp ? sp.name : ""}`.toLowerCase();
        if (!haystack.includes(searchQuery)) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      const empty = el(
        "li",
        "session empty-state",
        showMyAgendaOnly
          ? "No bookmarked sessions on this day match your filters. Click ☆ on any talk to add it to My Agenda."
          : "No sessions match the current filters on this day."
      );
      $("#timeline").replaceChildren(empty);
      return;
    }

    $("#timeline").replaceChildren(
      ...filtered.map((session) => {
        const isClash = clashes.has(session);
        const isPersonalClash = personalClashes.has(session.title);
        const row = el(
          "li",
          "session" + (isClash ? " clash" : "") + (isPersonalClash ? " personal-clash" : "")
        );
        const speaker = speakers.find((s) => s.id === session.speaker);
        const middle = el("div", "middle");
        const title = el("div", "title", session.title);
        if (isClash) title.append(el("span", "badge-clash", "⚠ Clash"));
        if (isPersonalClash) title.append(el("span", "badge-personal-clash", "⚡ Agenda Overlap"));
        middle.append(title);
        if (speaker) {
          middle.append(el("div", "who", `${speaker.name} · ${speaker.role}${speaker.company ? " (" + speaker.company + ")" : ""}`));
        }
        if (session.track || session.level) {
          const badges = el("div", "meta-badges");
          if (session.track) badges.append(el("span", "meta-pill", session.track));
          if (session.level) badges.append(el("span", "meta-pill", session.level));
          middle.append(badges);
        }

        const isSaved = savedTitles.has(session.title);
        const bookmarkBtn = el("button", "bookmark-btn", isSaved ? "⭐" : "☆");
        bookmarkBtn.type = "button";
        bookmarkBtn.setAttribute("aria-pressed", String(isSaved));
        bookmarkBtn.setAttribute("aria-label", isSaved ? `Remove ${session.title} from My Agenda` : `Save ${session.title} to My Agenda`);
        bookmarkBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (savedTitles.has(session.title)) {
            savedTitles.delete(session.title);
          } else {
            savedTitles.add(session.title);
          }
          drawSchedule();
        });

        row.append(
          el("div", "when", `${session.time} – ${session.end}`),
          middle,
          el("span", "room", session.room),
          bookmarkBtn
        );
        row.addEventListener("click", () => showSessionModal(session, row));
        return row;
      })
    );
  }

  drawSpeakers();
  drawSchedule();
}

/* 8. RSVP Registration & Attendee Badge Generator */
function initRegistration(event) {
  const form = $("#rsvp-form");
  const canvas = $("#badge-canvas");
  const downloadBtn = $("#download-badge-btn");
  const printBtn = $("#print-badge-btn");

  $$(".select-ticket-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const ticketSelect = $("#rsvp-ticket");
      if (ticketSelect && btn.dataset.ticket) {
        ticketSelect.value = btn.dataset.ticket;
      }
    });
  });

  if (printBtn) {
    printBtn.addEventListener("click", () => window.print());
  }

  if (!form) return;
  const regKey = "devfest_registration";
  const savedReg = JSON.parse(localStorage.getItem(regKey) || "null");

  function updateBadgeCard(data) {
    if (!data) return;
    $("#badge-name").textContent = data.fullname || "Your Name";
    $("#badge-title").textContent = `${data.role} · ${data.company}`;
    $("#badge-pill").textContent = (data.ticketType || "ATTENDEE").toUpperCase();
    const initials = (data.fullname || "DF")
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0].toUpperCase())
      .join("")
      .slice(0, 2);
    $("#badge-avatar").textContent = initials || "DF";
    $("#badge-id").textContent = `TICKET #${data.ticketId || "DF26-1024"}`;
  }

  if (savedReg) {
    updateBadgeCard(savedReg);
    $("#rsvp-name").value = savedReg.fullname || "";
    $("#rsvp-email").value = savedReg.email || "";
    $("#rsvp-role").value = savedReg.role || "";
    $("#rsvp-company").value = savedReg.company || "";
    $("#rsvp-ticket").value = savedReg.ticketType || "General Developer";
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#rsvp-name").value.trim();
    const email = $("#rsvp-email").value.trim();
    const role = $("#rsvp-role").value.trim();
    const company = $("#rsvp-company").value.trim();
    const ticket = $("#rsvp-ticket").value;

    let valid = true;
    if (!name) { $("#name-error").textContent = "Full name is required."; valid = false; } else { $("#name-error").textContent = ""; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { $("#email-error").textContent = "A valid email address is required."; valid = false; } else { $("#email-error").textContent = ""; }
    if (!role) { $("#role-error").textContent = "Role is required."; valid = false; } else { $("#role-error").textContent = ""; }
    if (!company) { $("#company-error").textContent = "Organization is required."; valid = false; } else { $("#company-error").textContent = ""; }

    if (!valid) return;

    const regData = {
      fullname: name,
      email,
      role,
      company,
      ticketType: ticket,
      ticketId: "DF26-" + Math.floor(1000 + Math.random() * 9000)
    };

    localStorage.setItem(regKey, JSON.stringify(regData));
    updateBadgeCard(regData);

    const success = $("#rsvp-success");
    if (success) {
      success.textContent = `✓ Registered for ${event.name} ${event.city} ${event.year}! Your badge is ready.`;
      success.style.display = "block";
    }
  });

  if (downloadBtn && canvas) {
    downloadBtn.addEventListener("click", () => {
      const name = $("#badge-name").textContent;
      const title = $("#badge-title").textContent;
      const pill = $("#badge-pill").textContent;
      const id = $("#badge-id").textContent;

      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = event.accent || "#4285f4";
      ctx.fillRect(0, 0, canvas.width, 100);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 32px sans-serif";
      ctx.fillText(`${event.name} ${event.city} ${event.year}`, 40, 62);

      ctx.font = "bold 18px sans-serif";
      ctx.fillText(pill, canvas.width - 240, 60);

      ctx.fillStyle = "#1e1e1e";
      ctx.font = "bold 44px sans-serif";
      ctx.fillText(name, 40, 200);

      ctx.fillStyle = "#5f6368";
      ctx.font = "24px sans-serif";
      ctx.fillText(title, 40, 250);

      ctx.fillStyle = "#f6f7fb";
      ctx.fillRect(40, 295, 290, 48);
      ctx.fillStyle = event.accent || "#4285f4";
      ctx.font = "bold 20px monospace";
      ctx.fillText(id, 56, 326);

      ctx.fillStyle = "#e3e5ec";
      ctx.fillRect(0, 435, canvas.width, 65);
      ctx.fillStyle = "#5f6368";
      ctx.font = "18px sans-serif";
      ctx.fillText(`${event.venue} · ${event.city} · ${event.date}`, 40, 474);

      const link = document.createElement("a");
      link.download = `devfest-badge-${name.replace(/\s+/g, "_").toLowerCase()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  }
}

/* 9. Searchable FAQ & Sticky Nav Scrollspy */
function initFaqAndScrollspy() {
  const faqSearch = $("#faq-search");
  if (faqSearch) {
    faqSearch.addEventListener("input", () => {
      const q = faqSearch.value.trim().toLowerCase();
      $$("#faq-list .faq-item").forEach((item) => {
        const match = item.textContent.toLowerCase().includes(q);
        item.style.display = match ? "" : "none";
        if (q && match) item.open = true;
      });
    });
  }

  const navLinks = [...$$("#main-nav a[href^='#']")];
  const sections = navLinks.map((a) => $(a.getAttribute("href"))).filter(Boolean);
  window.addEventListener("scroll", () => {
    const pos = window.scrollY + 140;
    let currentId = "";
    sections.forEach((sec) => {
      if (sec.offsetTop <= pos) currentId = `#${sec.id}`;
    });
    navLinks.forEach((a) => {
      a.classList.toggle("active", a.getAttribute("href") === currentId);
    });
  }, { passive: true });
}

function renderFooter(event) {
  $("#footer").textContent = `© ${event.year} ${event.name} ${event.city} · ${event.venue} · Built live with Antigravity CLI`;
}

async function main() {
  initTheme();
  Modal.init();
  initFaqAndScrollspy();
  const [event, speakers, schedule] = await Promise.all([load("event"), load("speakers"), load("schedule")]);
  renderHero(event);
  renderCountdown(event);
  renderSpeakersAndSchedule(speakers, schedule, event);
  initRegistration(event);
  renderFooter(event);
}

main();
