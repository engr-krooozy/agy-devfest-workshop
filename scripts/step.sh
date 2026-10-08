#!/usr/bin/env bash
# Show exactly what one workshop step changed:   ./scripts/step.sh 1
# With no argument, lists every step.
cd "$(dirname "$0")/.." || exit 1
if [ -z "$1" ]; then
  echo "Workshop steps (git tags on the 'solutions' branch):"
  git tag --list 'step-*' --sort=version:refname | while read -r t; do
    printf '  %-34s %s\n' "$t" "$(git log -1 --format=%s "$t")"
  done
  echo; echo "Usage: ./scripts/step.sh 1      (show the diff for step 1; 5a and 5b for the open floor)"
  echo "       git checkout step-1-dark-mode   (jump to the finished result)"
  exit 0
fi
tag=$(git tag --list "step-$1-*" | head -n1)
[ -z "$tag" ] && { echo "No step-$1-* tag. Run ./scripts/step.sh to list steps."; exit 1; }
git show --stat --patch --color=always "$tag" | ${PAGER:-less -R}
