# AGENTS.md: rules for this repo

pagetext is a tiny Python tool that fetches a web page and prints its text.

## Commands
- Run tests: `python -m unittest discover -s tests -v`
- Known failing on purpose: `python -m unittest discover -s bugs -v`
- Run the tool: `python -m pagetext.fetch URL`

## Rules
- Python standard library only. Do not add dependencies.
- Tests must never touch the network. Mock `urlopen`.
- After any code change, run the tests and report the result.
- Keep functions small and give public functions a one-line docstring.
- Do not edit anything under `bugs/` tests; fix the code instead.
