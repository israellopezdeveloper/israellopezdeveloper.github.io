PKG ?= pnpm
PROJECT_NAME := $(notdir $(CURDIR))
ZIP_NAME ?= $(PROJECT_NAME).zip
ZIP_DIR ?= ..

.PHONY: help install dev build preview check lint format gen-data gen-cv gen-projects gen-pdf clean distclean zip

help:
	@echo "Targets:"
	@echo "  install     - Install dependencies ($(PKG) install)"
	@echo "  dev         - Start Vite dev server"
	@echo "  build       - Production build (runs gen-data first)"
	@echo "  preview     - Preview built site"
	@echo "  check       - svelte-kit sync + svelte-check"
	@echo "  lint        - prettier --check + eslint"
	@echo "  format      - prettier --write"
	@echo "  gen-data    - Regenerate nn_works.ts, nn_projects.ts and CV.pdf"
	@echo "  clean       - Remove build artifacts (build/, .svelte-kit/)"
	@echo "  distclean   - clean + remove node_modules"
	@echo "  zip         - Create source zip in $(ZIP_DIR) (excludes build/secrets/deps)"

install:
	$(PKG) install

dev:
	$(PKG) dev

build: gen-data
	$(PKG) build

preview:
	$(PKG) preview

check:
	$(PKG) check

lint:
	$(PKG) lint

format:
	$(PKG) format

gen-cv:
	$(PKG) exec tsx src/script/cv-nn.ts --input src/lib/data/data_CV.json --output src/lib/data/nn_works.ts

gen-projects:
	$(PKG) exec tsx src/script/repos-nn.ts --input src/lib/data/data_projects.json --output src/lib/data/nn_projects.ts

gen-pdf:
	node src/script/cv-pdf.js src/lib/data/data_CV.json static/CV.pdf

gen-data: gen-cv gen-projects gen-pdf

clean:
	rm -rf build .svelte-kit

distclean: clean
	rm -rf node_modules

zip:
	@command -v zip >/dev/null 2>&1 || { echo "zip not found"; exit 1; }
	@cd $(CURDIR) && zip -r "$(ZIP_DIR)/$(ZIP_NAME)" . \
		-x '*.git/*' '.git/*' \
		-x 'node_modules/*' \
		-x 'build/*' \
		-x '.svelte-kit/*' \
		-x 'public/*' \
		-x '.env' '.env.*' '*.env' \
		-x '*/secrets/*' '*secret*' \
		-x 'pnpm-lock.yaml' 'package-lock.json' 'yarn.lock' 'bun.lockb' \
		-x '*.log' 'npm-debug.log*' 'pnpm-debug.log*' 'yarn-debug.log*' 'yarn-error.log*' \
		-x '.DS_Store' 'Thumbs.db' \
		-x '.cache/*' '.tmp/*' 'tmp/*' '.vite/*' \
		-x 'coverage/*' '.nyc_output/*' \
		-x 'static/CV.pdf' \
		-x '*.zip' '*.tar' '*.tar.gz' '*.tgz' >/dev/null 2>&1 \
	&& echo -n "✅" \
	|| echo -n "❌"
