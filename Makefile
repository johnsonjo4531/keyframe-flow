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

# Documentation pipeline (Milestone 6). These targets are scaffolding for the
# docs/storybook work: they assume devDependencies added while implementing
# Milestone 6 (typedoc, @clean-jsdoc-theme/typedoc, storybook +
# @storybook/react-vite) and intentionally do not run in `make test`.

SITE_DIR := site
STORYBOOK_CONFIG_DIR := examples/.storybook
GH_PAGES_BASE := /keyframe-flow

build-docs:
	# The landing page is authored under docs/ (T43) but must not be ingested
	# by the theme's docs walker, which picks up every .md/.html file. Park it
	# outside docs/ during the TypeDoc run, then restore it.
	mv docs/site-index.html .site-index.staged.html
	vp exec typedoc --options typedoc.json
	mv .site-index.staged.html docs/site-index.html

build-storybook:
	vp exec storybook build --config-dir $(STORYBOOK_CONFIG_DIR) --output-dir $(SITE_DIR)/storybook

typecheck-examples:
	vp exec tsc -p examples/tsconfig.json

github_pages_deploy:
	$(MAKE) build-docs
	$(MAKE) build-storybook
	rm -rf $(SITE_DIR)/index.html && cp docs/site-index.html $(SITE_DIR)/index.html
	touch $(SITE_DIR)/.nojekyll
	# --dotfiles so site/.nojekyll is published (GitHub Pages would otherwise
	# process the built site through Jekyll and drop _assets/ + underscore paths).
	pnpm dlx gh-pages --dotfiles -d $(SITE_DIR) -b gh-pages -t

commit_from_ai_message:
	git commit -F CURRENT_COMMIT_MESSAGE.md

