# Justfile for Evolution Stables (evo_02)
# Enforces "Done Means Walked" and standard operational gates

set shell := ["bash", "-c"]

# Default recipe: print available tasks
default:
    @just --list

# Install all workspace dependencies
install:
    pnpm install

# Run development servers
dev:
    pnpm run dev

# Build all packages and applications
build:
    pnpm run build

# Typecheck all packages and applications
typecheck:
    pnpm run typecheck

# Lint all packages and applications
lint:
    pnpm run lint

# Run all tests
test:
    pnpm run test

# Comprehensive verification gate ("Done Means Walked" baseline)
check: lint typecheck test
    @echo "✅ [evo_02] All lint, typecheck, and test gates PASSED."

# Clean build artifacts and caches
clean:
    rm -rf .turbo node_modules apps/*/.next apps/*/dist packages/*/dist
