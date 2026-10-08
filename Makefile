.PHONY: serve open test bugs follow reset steps preflight

serve:     ## the site with live reload on http://localhost:8000
	python3 serve.py
open:      ## open the site in your browser
	open http://localhost:8000 || xdg-open http://localhost:8000
test:      ## tests that must pass
	python3 -m unittest discover -s tests -v
bugs:      ## the bug report, failing on purpose
	python3 -m unittest discover -s bugs -v
follow:    ## which files the agent is touching, live
	./scripts/follow.sh
steps:     ## list every workshop step
	./scripts/step.sh
reset:     ## back to demo-start
	./scripts/reset.sh
preflight: ## check everything before the talk
	./scripts/preflight.sh
