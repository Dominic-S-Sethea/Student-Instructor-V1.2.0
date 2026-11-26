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

mkdir -p "${BACKUP_DIR}" "${BACKUP_DIR}/weekly" "${BACKUP_DIR}/monthly"
LOG_FILE="${BACKUP_LOG:-${BACKUP_DIR}/backup.log}"
mkdir -p "$(dirname "${LOG_FILE}")"

log() {
  local level="$1"; shift
  local timestamp
  timestamp="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"
  echo "[${timestamp}] [${level}] $*" | tee -a "${LOG_FILE}"
}

prune_tier() {
  local dir="$1"
  local keep="$2"
  local label="$3"
  mapfile -t FILES < <(ls -1t "${dir}"/cdes_platform_*.db 2>/dev/null || true)
  if [[ ${#FILES[@]} -gt ${keep} ]]; then
    for ((i = keep; i < ${#FILES[@]}; i++)); do
      if ${DRY_RUN}; then
        log "INFO" "[DRY-RUN] Would prune old ${label} backup: ${FILES[i]}"
      else
        rm -f "${FILES[i]}"
        log "INFO" "Pruned old ${label} backup: ${FILES[i]}"
      fi
    done
  fi
}

log "INFO" "Starting backup of ${DB_FILE}"
if [[ ! -f "${DB_FILE}" ]]; then
  log "ERROR" "Database file not found: ${DB_FILE}"
  exit 1
fi

BACKUP_TIMESTAMP="$(date -u +'%Y%m%dT%H%M%SZ')"
DAY_OF_WEEK="$(date -u +'%u')"
DAY_OF_MONTH="$(date -u +'%d')"
BACKUP_LABEL="cdes_platform_${BACKUP_TIMESTAMP}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_LABEL}.db"
TMP_BACKUP_PATH="${BACKUP_PATH}.tmp.$$.db"

if ${DRY_RUN}; then
  log "INFO" "[DRY-RUN] Would run online backup of ${DB_FILE} -> ${BACKUP_PATH}"
else
  trap 'rm -f "${TMP_BACKUP_PATH}"' ERR
  if command -v sqlite3 >/dev/null 2>&1; then
    TMP_SQL_ESCAPED="${TMP_BACKUP_PATH//\'/\'\'}"
    sqlite3 "${DB_FILE}" <<SQL
.timeout 5000
PRAGMA wal_checkpoint(TRUNCATE);
VACUUM INTO '${TMP_SQL_ESCAPED}';
SQL
    if ! sqlite3 "${TMP_BACKUP_PATH}" "PRAGMA busy_timeout = 5000; PRAGMA integrity_check;" | grep -qx "ok"; then
      log "ERROR" "Backup integrity_check failed!"
      rm -f "${TMP_BACKUP_PATH}"
      exit 1
    fi
    if [[ -n "$(sqlite3 "${TMP_BACKUP_PATH}" "PRAGMA busy_timeout = 5000; PRAGMA foreign_keys = ON; PRAGMA foreign_key_check;")" ]]; then
      log "ERROR" "Backup foreign_key_check failed!"
      rm -f "${TMP_BACKUP_PATH}"
      exit 1
    fi
    mv -f "${TMP_BACKUP_PATH}" "${BACKUP_PATH}"
  else
    BACKUP_MJS="${SCRIPT_DIR}/backupRestore.mjs"
    if [[ ! -f "${BACKUP_MJS}" ]]; then
      log "ERROR" "Neither sqlite3 CLI nor ${BACKUP_MJS} is available."
      exit 1
    fi
    node "${BACKUP_MJS}" backup "${DB_FILE}" "${BACKUP_PATH}" >/dev/null
  fi
  trap - ERR
  log "INFO" "Backup verified (integrity_check=ok, foreign_key_check=empty): ${BACKUP_PATH}"

  if [[ "${DAY_OF_WEEK}" == "7" && ${KEEP_WEEKLY} -gt 0 ]]; then
    cp -f "${BACKUP_PATH}" "${BACKUP_DIR}/weekly/${BACKUP_LABEL}.db"
  fi
  if [[ "${DAY_OF_MONTH}" == "01" && ${KEEP_MONTHLY} -gt 0 ]]; then
    cp -f "${BACKUP_PATH}" "${BACKUP_DIR}/monthly/${BACKUP_LABEL}.db"
  fi
fi

prune_tier "${BACKUP_DIR}" "${KEEP_DAILY}" "daily"
prune_tier "${BACKUP_DIR}/weekly" "${KEEP_WEEKLY}" "weekly"
prune_tier "${BACKUP_DIR}/monthly" "${KEEP_MONTHLY}" "monthly"

exit 0
