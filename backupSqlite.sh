#!/bin/sh
cd /home/andreas

exec 2>&1
export USER=andreas
export HOME=/home/andreas
export NODE_ENV=production
# Include the user-specific profile
. $HOME/.profile

BACKUPS=/home/andreas/database-backups
KEEPDAYS=90

/home/andreas/.nvm/versions/node/v18.18.0/bin/node /home/andreas/JC-Backoffice/application/batchjobs/src/database-backup/backup-sqlite.js "${BACKUPS}"

/usr/bin/find "${BACKUPS}" -type f -mtime "+${KEEPDAYS}" -exec /bin/rm -v '{}' ';'
