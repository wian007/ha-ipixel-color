# ──────────────────────────────────────────────────────────────────────────────
# Developer Makefile for the iPIXEL Color Home Assistant integration
#
# Targets
# ───────
#   make setup    – create .venv and install all dev dependencies
#   make lint     – run ruff linter and mypy type checker
#   make format   – auto-format code with ruff
#   make test     – run the test suite (with coverage)
#   make clean    – remove generated artifacts
# ──────────────────────────────────────────────────────────────────────────────

VENV        := .venv
PYTHON      := $(VENV)/bin/python
PIP         := $(VENV)/bin/pip
PYTEST      := $(VENV)/bin/pytest
RUFF        := $(VENV)/bin/ruff
MYPY        := $(VENV)/bin/mypy
COMPONENT   := custom_components/ipixel_color

.PHONY: setup lint format test clean help

help:
	@echo "Available targets:"
	@echo "  setup    – create venv and install dev dependencies"
	@echo "  lint     – run ruff + mypy"
	@echo "  format   – auto-format with ruff"
	@echo "  test     – run pytest with coverage"
	@echo "  clean    – remove generated files"

# ── Setup ─────────────────────────────────────────────────────────────────────
setup: $(VENV)/bin/activate

$(VENV)/bin/activate: requirements_dev.txt
	python3 -m venv $(VENV)
	$(PIP) install --upgrade pip
	$(PIP) install -r requirements_dev.txt
	@echo "\n✅  Virtual environment ready.  Run:  source .venv/bin/activate"

# ── Lint ──────────────────────────────────────────────────────────────────────
lint:
	$(RUFF) check $(COMPONENT)
	$(MYPY) $(COMPONENT)

# ── Format ────────────────────────────────────────────────────────────────────
format:
	$(RUFF) format $(COMPONENT)
	$(RUFF) check --fix $(COMPONENT)

# ── Test ──────────────────────────────────────────────────────────────────────
test:
	$(PYTEST) tests/ \
	    --cov=$(COMPONENT) \
	    --cov-report=term-missing \
	    -v

# ── Clean ─────────────────────────────────────────────────────────────────────
clean:
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -name "*.pyc" -delete
	rm -rf .coverage htmlcov/ $(VENV)
	@echo "✅  Cleaned."
