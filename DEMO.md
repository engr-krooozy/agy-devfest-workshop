# DEMO.md: every prompt, in slide order

Copy-paste ready. Each block says **what you type**, **what the audience sees**, and
**what to do if it goes wrong**. Slide numbers match the deck.

**Setup (before the talk):** `make preflight`, then two panes: `agy` on the left,
`make follow` on the right. Font 18pt+. Run `/clear` in `agy`.
**Reset anytime:** `make reset`. **Skip ahead:** `git checkout <tag>` (listed per step).

---

## Slide 5: One agent core
```
/settings
```
Audience sees: the settings screen. Say these are the same settings the desktop app reads. `Esc` out. Change nothing.

## Slide 9: Install (do NOT run the installer live)
```bash
which agy
agy --version
```

## Slide 10: First launch, first prompt
```bash
cd agy-devfest-workshop && agy
```
Point at the status bar: **1 skill, explain-flow**. Then send:
```
Write a small python script that fetches the text of a web page
```
Expected: the agent notices `pagetext/fetch.py` already exists. After ~15 s press `Esc`.
Say: "Esc is your escape hatch." Leave the session open. No file changes.

## Slide 13: Modes
Press `Shift+Tab` three times: `default → accept-edits → plan → default`. Land on **plan**, send:
```
Add a --timeout flag to the script
```
Expected: it reads `fetch.py` and outlines the change. **The right pane stays empty. That is the demo.**
Press `Esc` before it finishes.

## Slide 14: Review the deliverable (step-14)
Back to default mode. Send:
```
Add a docstring and a unit test for the fetch function
```
When artifacts appear: `ctrl+r`, `↑/↓`, `p` to preview, `Enter` to open.
On a line in the test file press `c` and type:
```
also cover a non-UTF-8 charset
```
`Esc` back to the picker, `y` to approve one file, `n` to reject another, `Esc` to submit.

Audience sees on the right pane: `fetch.py` modified, `tests/test_fetch.py` new.
Expected result: `git diff demo-start step-14-docstring-and-test`
Skip ahead: `git checkout step-14-docstring-and-test`

## Slide 15: Conversation surgery
```
/rewind        (look at the checkpoint list, Esc out)
/fork
/resume        (pick your original session)
```
Say: the picker only lists sessions from **this** directory. `/fork` copies the chat, not your files.

## Slide 16: Keys
`@` (pick a file), `esc esc` (clear), then:
```
!git status
?
```

## Slide 18: Subagents (read-only, no file changes)
```
Search the whole repo for every place we make HTTP calls, then summarise the patterns
```
While it runs type `/agents`. Expected: **3 call sites**:

| File | User agent | Timeout |
|---|---|---|
| `pagetext/fetch.py` | `pagetext/0.1` | 10 s |
| `pagetext/robots.py` | `pagetext-robots/0.1` | 5 s |
| `pagetext/linkcheck.py` | `pagetext-linkcheck/0.1` | 3 s |

`Enter` on a running one to read its reasoning. `ctrl+k` approves a prompt inline. Also: `/tasks`.

## Slide 19: Gears (no live run)
```
/boost
```
No argument: shows help. `Esc`. Never run `/boost` or `/teamwork-preview` live.

## Slide 23: Headless (second terminal tab)
```bash
agy -p "in one sentence, what does git bisect do?"
agy -p "name three version control systems" > out.txt
cat out.txt
agy models
```
Audience sees: clean output in the file, no progress noise (it went to stderr).

## Slide 24: Typed output (second terminal tab)
```bash
agy -p "parse the version string v2.14.3 into major, minor, patch integers" \
  --output-format json --json-schema demo/semver.schema.json | jq '.structured_output'
```
Expected:
```json
{ "major": 2, "minor": 14, "patch": 3 }
```
Then:
```bash
agy -p "say hi" --output-format json | jq '.usage'
```

## Slide 25: Skills (step-25)
```bash
cat demo/standup.md
cp demo/standup.md .agents/skills/standup.md
```
In the TUI: `Ctrl+D`, then `agy`. Type `/` and show **/standup** in the list. Run:
```
/standup
```
Also: `agy plugin list` and `/hooks`.
Audience sees on the right pane: `.agents/skills/standup.md` appears.
Skip ahead: `git checkout step-25-standup-skill`

## Slide 26: Permissions (read only, change nothing)
```
/permissions
```
Walk the three lists. `Esc`. Then:
```
Run git status and tell me what changed
```
When the approval card appears, **edit the target string** to widen it, then approve.
Reference: `demo/settings.example.json`.

## Slide 27: Sandbox (second terminal tab)
```bash
agy --sandbox -p "list the files in this directory"
```
Do not try a blocked command live.

## Slide 28: Verification loop (step-28)
```
Add a retry with backoff to the fetch function. Run the tests afterward to verify.
```
Let it write, run the tests, react. **If a test fails, do not fix it. Let the agent iterate.**
Then show the rules it followed:
```
!cat AGENTS.md
```
Audience sees on the right pane: `fetch.py` and `tests/test_fetch.py` change, then `OK`.
Expected result: `git diff step-25-standup-skill step-28-retry-backoff`
Skip ahead: `git checkout step-28-retry-backoff`

## Slide 29: Open floor
Stay in default mode. Hand on `Esc`. Pick what the room picks:

**A failing test** (step-29a-fix-script-style-bug)
```bash
python -m unittest discover -s bugs -v
```
```
Fix the bug these tests describe
```
Expected: `extract.py` now skips `<script>` and `<style>`. `bugs/` goes green.

**An unfamiliar file** (no diff)
```
/explain-flow @pagetext/robots.py
```
Then `ctrl+r` and `m` to render the diagram in the terminal.

**A refactor you avoid** (step-29b-consolidate-http). Switch to plan mode first:
```
Consolidate the HTTP code in robots.py and linkcheck.py into fetch.py
```
Review the plan, then approve and let it write. Expected: one shared `http_request` in `fetch.py`.

**Quiet room fallback:** `/explain-flow @pagetext/robots.py`, then `ctrl+r` and `m`.

---

## Local demo site (no wifi needed)
```bash
make serve                       # terminal 1
python3 -m pagetext.fetch http://localhost:8000/index.html
```
Expected before the bug fix: the page text **includes** the `tracker` script line and the CSS.
After `step-29a-fix-script-style-bug`: only the readable text.
