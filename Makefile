.PHONY: test bugs serve follow reset steps preflight

test:      ## run the tests that should pass
	python3 -m unittest discover -s tests -v
bugs:      ## run the failing-on-purpose bug report
	python3 -m unittest discover -s bugs -v
serve:     ## serve the demo site on localhost:8000
	./scripts/serve.sh
follow:    ## live view of what the agent is changing
	./scripts/follow.sh
steps:     ## list every workshop step
	./scripts/step.sh
reset:     ## back to demo-start
	./scripts/reset.sh
preflight: ## check everything before the talk
	./scripts/preflight.sh
