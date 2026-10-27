# Shared helpers. Run the attack scripts from the repo root, in Git Bash on Windows.
BASE="${BASE:-http://localhost:8080}"
export MSYS_NO_PATHCONV=1 # stop Git Bash rewriting /app into a Windows path

# login EMAIL PASSWORD -> prints the JWT (empty if login failed)
login() {
  curl -s -X POST "$BASE/api/login" \
    -H 'content-type: application/json' \
    -d "{\"email\":\"$1\",\"password\":\"$2\"}" |
    sed -n 's/.*"token":"\([^"]*\)".*/\1/p'
}

say() { printf '\n\033[1;34m▶ %s\033[0m\n' "$*"; }
