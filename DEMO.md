# DEMO.md: every prompt, in slide order

Copy-paste ready. Slide numbers match the deck. Each step says **what you type**,
**what the audience sees in the browser**, and **how to skip ahead** if anything stalls.

**Setup (before the talk):** `make preflight`, then `make serve` in one terminal and
open http://localhost:8000. Put the browser and `agy` side by side. Optional third
window: `make follow`. Terminal font 18pt+. Run `/clear` in `agy`.
**Reset anytime:** `make reset` (the browser reloads by itself).

---

## Rehearsal status (agy 1.3.1)

| Slide | Tested | Result |
|---|---|---|
| 11, 25, 26, 30 | yes | worked as written |
| 15 dark mode | yes | same four files as `step-1-dark-mode`, tests green |
| 31 second day | yes | six Day 2 sessions added, tests ran and passed |
| 33 fix the clash | yes | same one-talk move as `step-5a-fix-clash`, `make bugs` green |
| 33 single source | yes | title, footer and server banner read `event.json`, new test added |
| 20, 28 | partly | need shell commands, so **approval cards appear**. Approve them |
| 14, 17, 18, 21, 29 | no | interactive TUI features, rehearse once |

The agent's wording and exact file edits vary between runs. The visible result in the browser should not.

---

## Slide 6: One agent core
```
/settings
```
Same settings the desktop app reads. `Esc` out. Change nothing.

## Slide 10: Install (do NOT run the installer live)
```bash
which agy
agy --version
```

## Slide 11: First launch, first prompt
```bash
cd agy-devfest-workshop && agy
```
Point at the status bar: **1 skill, explain-flow**. Send:
```
In five lines, explain how this site gets its content onto the page
```
Expected: it reads `app.js` and the three JSON files in `site/data/`. After ~15 s press `Esc`.
Browser: **no change** (it only read files).

## Slide 14: Modes
`Shift+Tab` three times: `default → accept-edits → plan → default`. Land on **plan**, send:
```
Add a dark mode toggle to the site
```
Expected: it outlines the change. **The browser does not move. That is the demo.** `Esc` before it finishes.

## Slide 15: Review the deliverable (step-1-dark-mode)
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
Skip ahead: `git checkout step-1-dark-mode`

## Slide 17: Conversation surgery (the fork caveat, live)
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

## Slide 18: Keys
`@` then pick `site/data/event.json`. `esc esc` to clear. Then:
```
!git status
?
```

## Slide 20: Subagents (read-only)
```
Search the whole repo for every place the event name, city or year is typed in by hand instead of read from site/data/event.json, then summarise
```
While it runs type `/agents`. Expected: **3 spots that ignore `event.json`**:

| File | What is hard-coded |
|---|---|
| `site/index.html` | the `<title>` and the meta description |
| `site/app.js` | the footer text |
| `serve.py` | the startup banner |

The search runs shell commands (grep), so **approval cards appear**: `y` or `ctrl+k` to approve each.
That is slide 29 happening live. `Enter` on a running subagent to read its reasoning. Also: `/tasks`.
Set up the payoff: "we fix all three at the end".

## Slide 21: Gears (no live run)
```
/boost
```
No argument shows help. `Esc`. Never run `/boost` or `/teamwork-preview` live.

## Slide 25: Headless (second terminal tab)
```bash
agy -p "in one sentence, what does git bisect do?"
agy -p "name three version control systems" > out.txt
cat out.txt
agy models
```

## Slide 26: Typed output (step-2-new-speaker)
```bash
cat demo/new-speaker-bio.txt
agy -p "Extract the speaker from this bio: $(cat demo/new-speaker-bio.txt)" \
  --output-format json --json-schema demo/speaker.schema.json | jq '.structured_output'
```
Expected (tested):
```json
{ "name": "Chidi Eze", "role": "Staff Machine Learning Engineer", "topic": "Evaluating AI agents before they reach users" }
``` Now put it on the page:
```bash
agy -p "Extract the speaker from this bio: $(cat demo/new-speaker-bio.txt)" \
  --output-format json --json-schema demo/speaker.schema.json \
  | jq '.structured_output' | ./scripts/add-speaker.sh
```
Browser: **a fifth speaker card appears.** Then:
```bash
agy -p "say hi" --output-format json | jq '.usage'
```
Skip ahead: `git checkout step-2-new-speaker`

## Slide 28: Skills (step-3-standup-skill)
```bash
cat demo/standup.md
cp demo/standup.md .agents/skills/standup.md
```
In the TUI: `Ctrl+D`, then `agy`. Type `/` and show **/standup** in the list. Run:
```
/standup
```
It reads the git log, so an **approval card for a git command appears**: approve it.
Also: `agy plugin list` and `/hooks`. Browser: no change. This one lives in the terminal.

## Slide 29: Permissions (read only)
```
/permissions
```
Walk the three lists. `Esc`. Then:
```
Run git status and tell me what changed
```
When the approval card appears, **edit the target** to widen it, then approve. Reference: `demo/settings.example.json`.

## Slide 30: Sandbox (second terminal tab)
```bash
agy --sandbox -p "Read AGENTS.md and tell me, in one line, what the test command is"
```
Expected: `python3 -m unittest discover -s tests -v`. Reading files is allowed by default, so it runs
under containment with no prompt. (Headless mode cannot ask for approval, so a prompt that needs a
shell command is auto-denied. Keep this one to file reads.)

## Slide 31: Verification loop (step-4-two-days)
```
Add a second conference day with six sessions to site/data/schedule.json. Use the existing speakers. Run the tests afterward to verify.
```
Browser: **Day 1 / Day 2 tabs appear.** Click Day 2.
**If a test fails, do not fix it. Let the agent iterate.** Then:
```
!cat AGENTS.md
```
Point at the rule that tells it to run the tests after changing `site/data/`.
Skip ahead: `git checkout step-4-two-days`

## Slide 33: Open floor
Default mode, one hand on `Esc`.

**A failing test** (step-5a-fix-clash). Show the red **⚠ Clash** badges in the browser, then:
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

**A refactor you avoid** (step-5b-single-source). Switch to plan mode first:
```
Make every hard-coded event name, city and year come from site/data/event.json
```
Review the plan, approve, let it write. Then edit `"city"` in `site/data/event.json`:
the headline, **browser tab title and footer** all change. Restart `make serve` to see the banner.

**Quiet room fallback:** `/explain-flow @site/app.js`, then `ctrl+r` and `m`.

## Closing move
Ask everyone to put **their own city** in `site/data/event.json`. A room full of laptops, each showing a different DevFest.
