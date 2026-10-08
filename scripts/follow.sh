#!/usr/bin/env bash
# The "audience screen": run this in a split pane next to agy.
# It redraws every second so everyone sees files appear and change as the agent works.
cd "$(dirname "$0")/.." || exit 1
B=$'\033[1m'; D=$'\033[2m'; G=$'\033[32m'; Y=$'\033[33m'; R=$'\033[31m'; C=$'\033[36m'; N=$'\033[0m'
trap 'tput cnorm; exit' INT TERM
tput civis
while true; do
  out=$(
    echo "${B}${C}  pagetext · live changes${N}   ${D}$(date +%H:%M:%S)${N}"
    echo "${D}  branch: $(git rev-parse --abbrev-ref HEAD)  ·  base: $(git describe --tags --always 2>/dev/null)${N}"
    echo
    status=$(git status --short)
    if [ -z "$status" ]; then
      echo "  ${D}working tree clean, waiting for the agent...${N}"
    else
      echo "${B}  Changed files${N}"
      echo "$status" | while IFS= read -r line; do
        case "$line" in
          "??"*) echo "  ${G}+ ${line:3}${N}  ${D}(new)${N}";;
          " D"*|"D "*) echo "  ${R}- ${line:3}${N}  ${D}(deleted)${N}";;
          *) echo "  ${Y}~ ${line:3}${N}";;
        esac
      done
      echo
      echo "${B}  Diff stat${N}"
      git diff --stat --color=always | sed 's/^/  /'
      echo
      echo "${B}  Latest diff${N}"
      git diff --color=always -U1 | head -n 28 | sed 's/^/  /'
    fi
  )
  clear
  printf '%s\n' "$out"
  sleep 1
done
