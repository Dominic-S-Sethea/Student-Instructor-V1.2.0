#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
DB_FILE="${DATABASE_PATH:-${SERVER_DIR}/data/cdes_platform.db}"
BACKUP_DIR="${BACKUP_DIR:-${SERVER_DIR}/data/backups}"
RETENTION_DAILY=${RETENTION_DAILY:-7}
RETENTION_WEEKLY=${RETENTION_WEEKLY:-4}
RETENTION_MONTHLY=${RETENTION_MONTHLY:-12}

KEEP_DAILY=${RETENTION_DAILY}
KEEP_WEEKLY=${RETENTION_WEEKLY}
KEEP_MONTHLY=${RETENTION_MONTHLY}
DRY_RUN=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --db) DB_FILE="$2"; shift 2;;
    --backup-dir) BACKUP_DIR="$2"; shift 2;;
    --keep-daily) KEEP_DAILY="$2"; shift 2;;
    --keep-weekly) KEEP_WEEKLY="$2"; shift 2;;
    --keep-monthly) KEEP_MONTHLY="$2"; shift 2;;
    --dry-run) DRY_RUN=true; shift;;
    *) echo "Unknown argument: $1" >&2; exit 1;;
  esac
done

mkdir -p "${BACKUP_DIR}"
LOG_FILE="${BACKUP_LOG:-${BACKUP_DIR}/backup.log}"
mkdir -p "$(dirname "${LOG_FILE}")"

log() {
  local level="$1"; shift
  local timestamp
  timestamp="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"
  echo "[${timestamp}] [${level}] $*" | tee -a "${LOG_FILE}"
}

log "INFO" "Starting backup of ${DB_FILE}"
if [[ ! -f "${DB_FILE}" ]]; then
  log "ERROR" "Database file not found: ${DB_FILE}"
  exit 1
fi

BACKUP_TIMESTAMP="$(date -u +'%Y%m%dT%H%M%SZ')"
BACKUP_LABEL="cdes_platform_${BACKUP_TIMESTAMP}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_LABEL}.db"

if ${DRY_RUN}; then
  log "INFO" "[DRY-RUN] Would run: sqlite3 '${DB_FILE}' '.backup ${BACKUP_PATH}'"
else
  sqlite3 "${DB_FILE}" ".backup '${BACKUP_PATH}'"
  if ! sqlite3 "${BACKUP_PATH}" "PRAGMA integrity_check;" | grep -qx "ok"; then
    log "ERROR" "Backup integrity_check failed!"
    exit 1
  fi
  if [[ -n "$(sqlite3 "${BACKUP_PATH}" "PRAGMA foreign_keys = ON; PRAGMA foreign_key_check;")" ]]; then
    log "ERROR" "Backup foreign_key_check failed!"
    exit 1
  fi
  log "INFO" "Backup verified (integrity_check=ok, foreign_key_check=empty): ${BACKUP_PATH}"
fi

# Daily rotation: keep newest KEEP_DAILY backups
mapfile -t BACKUPS < <(ls -1t "${BACKUP_DIR}"/cdes_platform_*.db 2>/dev/null || true)
if [[ ${#BACKUPS[@]} -gt ${KEEP_DAILY} ]]; then
  for ((i = KEEP_DAILY; i < ${#BACKUPS[@]}; i++)); do
    if ${DRY_RUN}; then
      log "INFO" "[DRY-RUN] Would prune old backup: ${BACKUPS[i]}"
    else
      rm -f "${BACKUPS[i]}"
      log "INFO" "Pruned old backup: ${BACKUPS[i]}"
    fi
  done
fi

exit 0
