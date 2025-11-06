#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEFAULT_ROOT="$SCRIPT_DIR/../src"
DRY_RUN="${DRY_RUN:-0}"

if [[ $# -ge 1 ]]; then
  ROOTS=("$@")
else
  ROOTS=("$DEFAULT_ROOT")
fi

if command -v git >/dev/null 2>&1 && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  USE_GIT=1
else
  USE_GIT=0
fi

to_kebab() {
  # 1) camelCase/PascalCase -> kebab
  # 2) lowercase
  # 3) troca qualquer separador por '-'
  # 4) trim de '-'
  local in="$1" out
  out="$(printf "%s" "$in" | sed -E 's/([a-z0-9])([A-Z])/\1-\L\2/g')"
  out="$(printf "%s" "$out" | tr '[:upper:]' '[:lower:]')"
  out="$(printf "%s" "$out" | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//')"
  printf "%s" "$out"
}

need_perl() {
  if ! command -v perl >/dev/null 2>&1; then
    echo "Perl is required for safe in-place replacements on macOS. Install it or adjust the script." >&2
    exit 1
  fi
}

TMPDIR_ROOT="$(mktemp -d 2>/dev/null || mktemp -d -t kebab)"
MAP_FILE="$TMPDIR_ROOT/map.tsv"            # old_path<TAB>new_path
BASE_MAP_FILE="$TMPDIR_ROOT/base.tsv"      # old_basename<TAB>new_basename
> "$MAP_FILE"
> "$BASE_MAP_FILE"

FOUND_ANY=0

for ROOT in "${ROOTS[@]}"; do
  if [[ ! -d "$ROOT" ]]; then
    echo "Directory not found: $ROOT" >&2
    continue
  fi

  while IFS= read -r -d '' f; do
    FOUND_ANY=1
    dir="$(dirname "$f")"
    base="$(basename "$f" .ts)"
    ext=".ts"

    kebab="$(to_kebab "$base")"
    new_path="$dir/$kebab$ext"

    if [[ "$new_path" != "$f" ]]; then
      # garante unicidade
      if [[ -e "$new_path" ]]; then
        i=1
        while [[ -e "$dir/$kebab-$i$ext" ]]; do i=$((i+1)); done
        new_path="$dir/$kebab-$i$ext"
      fi
      printf "%s\t%s\n" "$f" "$new_path" >> "$MAP_FILE"
      printf "%s\t%s\n" "$base" "$(basename "$new_path" .ts)" >> "$BASE_MAP_FILE"
    fi
  done < <(find "$ROOT" -type f -name '*.ts' -print0)
done

if [[ "$FOUND_ANY" -eq 0 ]]; then
  echo "No .ts files found under provided roots."
  rm -rf "$TMPDIR_ROOT"
  exit 0
fi

if [[ ! -s "$MAP_FILE" ]]; then
  echo "All .ts filenames are already kebab-case. Nothing to rename."
  rm -rf "$TMPDIR_ROOT"
  exit 0
fi

echo "Planned renames:"
awk -F'\t' '{print "  " $1 " -> " $2}' "$MAP_FILE"

if [[ "$DRY_RUN" == "1" ]]; then
  echo "Dry-run mode. Set DRY_RUN=0 to apply."
  rm -rf "$TMPDIR_ROOT"
  exit 0
fi

# Ordena por comprimento decrescente do caminho antigo para evitar colisões
SORTED_MAP="$TMPDIR_ROOT/map.sorted.tsv"
awk -F'\t' '{ print length($1) "\t" $0 }' "$MAP_FILE" | sort -rn | cut -f2- > "$SORTED_MAP"

while IFS=$'\t' read -r old new; do
  echo "Renaming: $old -> $new"
  mkdir -p "$(dirname "$new")"
  if [[ "$USE_GIT" -eq 1 ]]; then
    git mv -f "$old" "$new"
  else
    mv -f "$old" "$new"
  fi
done < "$SORTED_MAP"

echo "Updating import/export paths..."
need_perl

# Remove duplicados por basename
SORTED_BASE="$TMPDIR_ROOT/base.sorted.tsv"
awk -F'\t' '!seen[$1]++' "$BASE_MAP_FILE" > "$SORTED_BASE"

# Para cada base renomeada, ajusta qualquer string '/OldBase' ou '/OldBase.ts' para o novo nome
# Isso funciona porque só mudamos o basename; diretórios permanecem.
while IFS=$'\t' read -r oldbase newbase; do
  find "${ROOTS[@]}" -type f -name '*.ts' -print0 | xargs -0 perl -0777 -pi -e "s@/$(printf '%s' "$oldbase" | sed 's/[].[^$*\/]/\\&/g')([\"'])@/$newbase\$1@g;"
  find "${ROOTS[@]}" -type f -name '*.ts' -print0 | xargs -0 perl -0777 -pi -e "s@/$(printf '%s' "$oldbase" | sed 's/[].[^$*\/]/\\&/g')\.ts([\"'])@/$newbase.ts\$1@g;"
done < "$SORTED_BASE"

echo "Done."