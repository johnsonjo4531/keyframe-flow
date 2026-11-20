go:
	$(MAKE) install && $(MAKE) run

install:
	vp install

run:
	vp dev --host

vibe:
	$(MAKE) vibe_code

vibe_code:
	$(MAKE) opencode_cli_jai

opencode_web_jai:
	jai -j opencode opencode web --hostname 0.0.0.0

opencode_cli_jai:
	jai -j opencode opencode .

pi_cli_jai:
	jai -j pi pi

test:
	$(MAKE) typecheck && $(MAKE) lint && $(MAKE) test-unit && $(MAKE) test-browser

typecheck:
	vp check

lint:
	vp lint

test-unit:
	vp test run

test-browser:
	vp test run --config vitest.browser.config.ts

commit_from_ai_message:
	git commit -F CURRENT_COMMIT_MESSAGE.md

