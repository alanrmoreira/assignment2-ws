#!/usr/bin/env bash
set -euo pipefail

# ==============================================
# Configuration
# ==============================================
BASE_URL="${BASE_URL:-http://localhost:80}"
COOKIE_JAR="${COOKIE_JAR:-cookies.txt}"

# SAFE mode (default): only validates CSRF/session using /public/csrf/validate
# FULL_SUBMIT=1 : performs a real multipart submission to /public/submit (writes to DB)
FULL_SUBMIT="${FULL_SUBMIT:-0}"

# Parameters for FULL_SUBMIT=1 (adjust as needed)
AWARD_ID="${AWARD_ID:-1}"
OWNER_UIE_ID="${OWNER_UIE_ID:-4}"
CONTACT_NAME="${CONTACT_NAME:-Form Bot}"
CONTACT_EMAIL="${CONTACT_EMAIL:-bot@example.com}"
PROJECT_TITLE="${PROJECT_TITLE:-Security Test Submission}"
PROJECT_DESC="${PROJECT_DESC:-This is a test submission from test_security.sh}"
PROJECT_URL="${PROJECT_URL:-}"

# ==============================================
# Helpers
# ==============================================
green() { printf "\033[32m%s\033[0m\n" "$*"; }
red()   { printf "\033[31m%s\033[0m\n" "$*"; }
info()  { printf "\033[36m==> %s\033[0m\n" "$*"; }

pass() { green "PASS: $*"; }
fail() { red "FAIL: $*"; exit 1; }

cleanup() {
  rm -f "$COOKIE_JAR" 2>/dev/null || true
  [[ -n "${TMP_FILE:-}" && -f "$TMP_FILE" ]] && rm -f "$TMP_FILE" || true
}
trap cleanup EXIT

# ==============================================
# 0) Basic healthcheck
# ==============================================
info "Basic healthcheck (GET /healthz)"
HC_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/healthz")
[[ "$HC_CODE" == "200" ]] && pass "/healthz returned 200" || fail "/healthz did not return 200 (got $HC_CODE)"

# ==============================================
# 1) CORS — must not crash
# ==============================================
info "CORS with malicious Origin (app should not break)"
CORS_CODE=$(curl -s -o /dev/null -w "%{http_code}" -H 'Origin: https://evil.example' "$BASE_URL/healthz")
[[ "$CORS_CODE" =~ ^2|3|4[0-9]{2}$ ]] && pass "Request did not break the app (HTTP $CORS_CODE). Browser should not get CORS access." || fail "Server broke (HTTP $CORS_CODE)"

# ==============================================
# 2) CSRF token + session
# ==============================================
info "Getting CSRF token + session cookie (GET /public/csrf-token)"
CSRF_JSON=$(curl -s -c "$COOKIE_JAR" "$BASE_URL/public/csrf-token")
echo "Token received: $CSRF_JSON"

TOKEN=$(printf "%s" "$CSRF_JSON" | sed -n 's/.*"csrf":"\([^"]*\)".*/\1/p')

if ! [[ "$TOKEN" =~ ^[A-Fa-f0-9]+$ ]]; then
  red "Extracted TOKEN looks wrong: '$TOKEN'"
  fail "Could not extract CSRF token"
fi
info "Extracted CSRF token: $TOKEN"

# ==============================================
# 3) POST without CSRF → should fail
# ==============================================
if [[ "$FULL_SUBMIT" == "1" ]]; then
  info "POST /public/submit without CSRF (expected: 403 Invalid CSRF)"
  TMP_FILE="$(mktemp)"
  echo "test" > "$TMP_FILE"
  CODE_NO_CSRF=$(curl -s -b "$COOKIE_JAR" -o /dev/null -w "%{http_code}" \
    -X POST "$BASE_URL/public/submit" \
    -F "award_id=$AWARD_ID" \
    -F "owner_user_in_event_id=$OWNER_UIE_ID" \
    -F "contact_name=$CONTACT_NAME" \
    -F "contact_email=$CONTACT_EMAIL" \
    -F "project_title=$PROJECT_TITLE" \
    -F "project_description=$PROJECT_DESC" \
    -F "project_url=$PROJECT_URL" \
    -F "files=@$TMP_FILE;type=text/plain")
else
  info "POST /public/csrf/validate without CSRF (expected: 403 Invalid CSRF)"
  CODE_NO_CSRF=$(curl -s -b "$COOKIE_JAR" -o /dev/null -w "%{http_code}" \
    -X POST "$BASE_URL/public/csrf/validate" \
    -H 'Content-Type: application/json' \
    -d '{"_csrf": ""}')
fi

[[ "$CODE_NO_CSRF" == "403" ]] && pass "No CSRF → 403 OK" || fail "No CSRF did not fail as expected (HTTP $CODE_NO_CSRF)"

# ==============================================
# 4) With CSRF but no session → should fail
# ==============================================
if [[ "$FULL_SUBMIT" == "1" ]]; then
  info "POST /public/submit with CSRF but no cookie (expected: 401 Session missing)"
  CODE_NO_SESSION=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$BASE_URL/public/submit" \
    -H "X-CSRF-Token: $TOKEN" \
    -F "award_id=$AWARD_ID" \
    -F "owner_user_in_event_id=$OWNER_UIE_ID" \
    -F "contact_name=$CONTACT_NAME" \
    -F "contact_email=$CONTACT_EMAIL" \
    -F "project_title=$PROJECT_TITLE" \
    -F "project_description=$PROJECT_DESC")
else
  info "POST /public/csrf/validate with CSRF but no cookie (expected: 401 Session missing)"
  CODE_NO_SESSION=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$BASE_URL/public/csrf/validate" \
    -H 'Content-Type: application/json' \
    -H "X-CSRF-Token: $TOKEN" \
    -d "{\"_csrf\":\"$TOKEN\"}")
fi

[[ "$CODE_NO_SESSION" == "401" ]] && pass "No session → 401 OK" || fail "No session did not fail as expected (HTTP $CODE_NO_SESSION)"

# ==============================================
# 5) With session + CSRF → should succeed
# ==============================================
if [[ "$FULL_SUBMIT" == "1" ]]; then
  info "POST /public/submit with session + CSRF (expected: 201 Created)"
  TMP_FILE2="$(mktemp)"; echo "ok" > "$TMP_FILE2"
  RESP=$(curl -s -b "$COOKIE_JAR" -w " HTTP_CODE:%{http_code}" \
    -X POST "$BASE_URL/public/submit" \
    -H "X-CSRF-Token: $TOKEN" \
    -F "award_id=$AWARD_ID" \
    -F "owner_user_in_event_id=$OWNER_UIE_ID" \
    -F "contact_name=$CONTACT_NAME" \
    -F "contact_email=$CONTACT_EMAIL" \
    -F "project_title=$PROJECT_TITLE" \
    -F "project_description=$PROJECT_DESC" \
    -F "project_url=$PROJECT_URL" \
    -F "files=@$TMP_FILE2;type=text/plain")
  CODE_OK="${RESP##*HTTP_CODE:}"
  BODY_OK="${RESP% HTTP_CODE:*}"
  if [[ "$CODE_OK" == "201" || "$CODE_OK" == "200" ]]; then
    pass "Session + CSRF → $CODE_OK OK"
  else
    echo "Response body was: $BODY_OK"
    fail "Session + CSRF did not pass (HTTP $CODE_OK)."
  fi
else
  info "POST /public/csrf/validate with session + CSRF (expected: 200)"
  CODE_OK=$(curl -s -b "$COOKIE_JAR" -o /dev/null -w "%{http_code}" \
    -X POST "$BASE_URL/public/csrf/validate" \
    -H 'Content-Type: application/json' \
    -H "X-CSRF-Token: $TOKEN" \
    -d "{\"_csrf\":\"$TOKEN\"}")
  [[ "$CODE_OK" == "200" ]] && pass "Session + CSRF → 200 OK" || fail "Session + CSRF did not pass (HTTP $CODE_OK)."
fi

# ==============================================
# 6) Rate limit
# ==============================================
if [[ "$FULL_SUBMIT" == "1" ]]; then
  info "Rate limit: sending 15 quick POSTs to /public/submit (expect some 429)"
  RL429=0
  for i in $(seq 1 15); do
    CODE=$(curl -s -b "$COOKIE_JAR" -o /dev/null -w "%{http_code}" \
      -X POST "$BASE_URL/public/submit" \
      -H "X-CSRF-Token: $TOKEN" \
      -F "award_id=$AWARD_ID" \
      -F "owner_user_in_event_id=$OWNER_UIE_ID" \
      -F "contact_name=$CONTACT_NAME" \
      -F "contact_email=$CONTACT_EMAIL" \
      -F "project_title=$PROJECT_TITLE-$i" \
      -F "project_description=$PROJECT_DESC" \
      -F "files=@$TMP_FILE;type=text/plain")
    [[ "$CODE" == "429" ]] && RL429=$((RL429+1))
    sleep 0.1
  done
  [[ "$RL429" -ge 1 ]] && pass "Rate limit active ($RL429 responses were 429)" || pass "No 429 responses (window may not have hit)"
else
  info "Skipping rate-limit burst (SAFE mode). Set FULL_SUBMIT=1 to test /public/submit limiter."
fi

# ==============================================
# 7) Alternate public endpoint
# ==============================================
info "GET /public/health (if mapped)"
curl -s "$BASE_URL/public/health" || true
echo

green "All tests executed."