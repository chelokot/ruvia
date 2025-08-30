#!/usr/bin/env bash
set -euo pipefail

HOOK_DIR=".git/hooks"
HOOK_FILE="$HOOK_DIR/pre-commit"

mkdir -p "$HOOK_DIR"
cat > "$HOOK_FILE" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

# Generate styles before commit
npm run --silent generate:styles

# Ensure the generated file is staged
git add src/data/styles.generated.ts
EOF

chmod +x "$HOOK_FILE"
echo "Installed pre-commit hook to run generate:styles."

