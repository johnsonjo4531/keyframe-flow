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
	$(MAKE) typecheck && $(MAKE) lint && $(MAKE) typecheck-react && $(MAKE) typecheck-examples && $(MAKE) test-unit && $(MAKE) test-browser

typecheck:
	vp check

lint:
	vp lint

# React integration (src/react, T52) — kept out of the core project so §2
# principle 1 stays machine-checked; this project adds DOM + React types.
typecheck-react:
	vp exec tsc -p tsconfig.react.json

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
	# Guide embeds (T50) point at the published GitHub Pages host; this shim is
	# a no-op there and rewrites them to same-origin on any other origin, so a
	# locally served copy of site/ previews embeds against the local Storybook.
	cp docs/embed-host-rewrite.js site/docs/embed-host-rewrite.js
	grep -rlZ --include='*.html' '</body>' site/docs | xargs -0 perl -pi -e 's{</body>}{<script src="/keyframe-flow/docs/embed-host-rewrite.js" defer></script></body>}'

build-storybook:
	vp exec storybook build --config-dir $(STORYBOOK_CONFIG_DIR) --output-dir $(SITE_DIR)/storybook

# Vanilla-TypeScript examples gallery (T56) — served at /keyframe-flow/examples/.
build-gallery:
	vp exec vite build --config vite.gallery.config.ts

typecheck-examples:
	vp exec tsc -p examples/tsconfig.json

# Serve the built site/ locally (docs + Storybook + gallery together) at
# http://localhost:4173/keyframe-flow/. Site pages use absolute /keyframe-flow/
# base paths, so the served root must expose site/ under that name — a symlink
# does it without copying. Uses python3's stdlib server: `serve` (and other
# "clean URL" static hosts) 301-redirect *.html requests to extensionless
# paths and drop query strings, which breaks Storybook's
# iframe.html?id=<story-id> embeds.
preview-site:
	@mkdir -p .preview
	ln -sfn $(CURDIR)/$(SITE_DIR) .preview/keyframe-flow
	@echo "Serving site/ at http://localhost:4173/keyframe-flow/"
	cd .preview && python3 -m http.server 4173

github_pages_deploy:
	$(MAKE) build-docs
	$(MAKE) build-storybook
	$(MAKE) build-gallery
	rm -rf $(SITE_DIR)/index.html && cp docs/site-index.html $(SITE_DIR)/index.html
	touch $(SITE_DIR)/.nojekyll
	# --dotfiles so site/.nojekyll is published (GitHub Pages would otherwise
	# process the built site through Jekyll and drop _assets/ + underscore paths).
	pnpm dlx gh-pages --dotfiles -d $(SITE_DIR) -b gh-pages -t

commit_from_ai_message:
	git commit -F CURRENT_COMMIT_MESSAGE.md

