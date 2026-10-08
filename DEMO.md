# DEMO.md: every prompt, in slide order

Copy-paste ready. Slide numbers match the deck. Each step says **what you type**,
**what the audience sees in the browser**, and **how to skip ahead** if anything stalls.

**Setup (before the talk):** `make preflight`, then `make serve` in one terminal and
open http://localhost:8000. Put the browser and `agy` side by side. Optional third
window: `make follow`. Terminal font 18pt+. Run `/clear` in `agy`.
**Reset anytime:** `make reset` (the browser reloads by itself).

---

## Slide 5: One agent core
```
/settings
```
Same settings the desktop app reads. `Esc` out. Change nothing.

## Slide 9: Install (do NOT run the installer live)
```bash
which agy
agy --version
```

## Slide 10: First launch, first prompt
```bash
cd agy-devfest-workshop && agy
```
Point at the status bar: **1 skill, explain-flow**. Send:
```
In five lines, explain how this site gets its content onto the page
```
Expected: it reads `app.js` and the three JSON files in `site/data/`. After ~15 s press `Esc`.
Browser: **no change** (it only read files).

## Slide 13: Modes
`Shift+Tab` three times: `default → accept-edits → plan → default`. Land on **plan**, send:
```
Add a dark mode toggle to the site
```
Expected: it outlines the change. **The browser does not move. That is the demo.** `Esc` before it finishes.

## Slide 14: Review the deliverable (step-14-dark-mode)
Back to default mode. Send:
```
Add a dark mode toggle to the header. Remember the choice and respect the visitor's system setting.
```
Browser: a 🌙 button appears in the header. Click it: the whole site goes dark.
When artifacts appear: `ctrl+r`, `↑/↓`, `p` to preview, `Enter` to open. On a line in `app.js` press `c`:
```
show a sun icon while dark mode is on
```
`Esc`, `y` to approve one file, `n` to reject another, `Esc` to submit.
Skip ahead: `git checkout step-14-dark-mode`

## Slide 15: Conversation surgery (the fork caveat, live)
```
/rewind        (look at the checkpoints, Esc out)
/fork
```
In the fork, send:
```
Change the accent colour in site/data/event.json to red
```
Browser: the whole page turns red. Then:
```
/resume        (pick your ORIGINAL session)
```
**The page is still red.** A fork copies the conversation, not your files. Undo it:
```
!git restore site/data/event.json
```

## Slide 16: Keys
`@` then pick `site/data/event.json`. `esc esc` to clear. Then:
```
!git status
?
```

## Slide 18: Subagents (read-only)
```
Search the whole repo for every place the event name, city or year is typed in by hand instead of read from site/data/event.json, then summarise
```
While it runs type `/agents`. Expected: **3 spots that ignore `event.json`**:

| File | What is hard-coded |
|---|---|
| `site/index.html` | the `<title>` and the meta description |
| `site/app.js` | the footer text |
| `serve.py` | the startup banner |

`Enter` on a running one to read its reasoning. `ctrl+k` approves inline. Also: `/tasks`.
Set up the payoff: "we fix all three at the end".

## Slide 19: Gears (no live run)
```
/boost
```
No argument shows help. `Esc`. Never run `/boost` or `/teamwork-preview` live.

## Slide 23: Headless (second terminal tab)
```bash
agy -p "in one sentence, what does git bisect do?"
agy -p "name three version control systems" > out.txt
cat out.txt
agy models
```

## Slide 24: Typed output (step-24-new-speaker)
```bash
cat demo/new-speaker-bio.txt
agy -p "Extract the speaker from this bio: $(cat demo/new-speaker-bio.txt)" \
  --output-format json --json-schema demo/speaker.schema.json | jq '.structured_output'
```
Expected: `{ "name": "Chidi Eze", "role": "...", "topic": "..." }`. Now put it on the page:
```bash
agy -p "Extract the speaker from this bio: $(cat demo/new-speaker-bio.txt)" \
  --output-format json --json-schema demo/speaker.schema.json \
  | jq '.structured_output' | ./scripts/add-speaker.sh
```
Browser: **a fifth speaker card appears.** Then:
```bash
agy -p "say hi" --output-format json | jq '.usage'
```
Skip ahead: `git checkout step-24-new-speaker`

## Slide 25: Skills (step-25-standup-skill)
```bash
cat demo/standup.md
cp demo/standup.md .agents/skills/standup.md
```
In the TUI: `Ctrl+D`, then `agy`. Type `/` and show **/standup** in the list. Run:
```
/standup
```
Also: `agy plugin list` and `/hooks`. Browser: no change. This one lives in the terminal.

## Slide 26: Permissions (read only)
```
/permissions
```
Walk the three lists. `Esc`. Then:
```
Run git status and tell me what changed
```
When the approval card appears, **edit the target** to widen it, then approve. Reference: `demo/settings.example.json`.

## Slide 27: Sandbox (second terminal tab)
```bash
agy --sandbox -p "list the files in this directory"
```

## Slide 28: Verification loop (step-28-two-days)
```
Add a second conference day with six sessions to site/data/schedule.json. Use the existing speakers. Run the tests afterward to verify.
```
Browser: **Day 1 / Day 2 tabs appear.** Click Day 2.
**If a test fails, do not fix it. Let the agent iterate.** Then:
```
!cat AGENTS.md
```
Point at the rule that tells it to run the tests after changing `site/data/`.
Skip ahead: `git checkout step-28-two-days`

## Slide 29: Open floor
Default mode, one hand on `Esc`.

**A failing test** (step-29a-fix-clash). Show the red **⚠ Clash** badges in the browser, then:
```bash
make bugs
```
```
Fix the bug these tests describe
```
Browser: the clash badges vanish.

**An unfamiliar file** (no change)
```
/explain-flow @site/app.js
```
Then `ctrl+r` and `m` to render the diagram in the terminal.

**A refactor you avoid** (step-29b-single-source). Switch to plan mode first:
```
Make every hard-coded event name, city and year come from site/data/event.json
```
Review the plan, approve, let it write. Then edit `"city"` in `site/data/event.json`:
the headline, **browser tab title and footer** all change. Restart `make serve` to see the banner.

**Quiet room fallback:** `/explain-flow @site/app.js`, then `ctrl+r` and `m`.

## Closing move
Ask everyone to put **their own city** in `site/data/event.json`. A room full of laptops, each showing a different DevFest.
