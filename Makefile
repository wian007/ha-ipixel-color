# Developer shortcuts for the iPIXEL Color integration
#   make setup   - create .venv with all dev dependencies
#   make test    - run the test suite (simulated panels, no hardware)
#   make lint    - ruff
#   make format  - ruff --fix
#   make card    - rebuild the Lovelace card bundle
#   make clean   - remove caches

VENV   := .venv
PY     := $(VENV)/bin/python
PIP    := $(VENV)/bin/pip
WWW    := custom_components/ipixel_color/www

.PHONY: setup test lint format card clean

setup: $(VENV)/bin/activate

$(VENV)/bin/activate: requirements_dev.txt
	python3 -m venv $(VENV)
	$(PIP) install --upgrade pip
	$(PIP) install -r requirements_dev.txt
	@touch $@

test: setup
	$(PY) -m pytest -q

lint: setup
	$(VENV)/bin/ruff check custom_components tests

format: setup
	$(VENV)/bin/ruff check --fix custom_components tests

card:
	cd $(WWW) && npm ci --no-audit --no-fund && npm run build && rm -f ipixel-display-card.js.map

clean:
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	rm -rf .pytest_cache .ruff_cache .coverage
