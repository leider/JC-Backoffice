#!/bin/sh
cd /home/andreas

exec 2>&1
export USER=andreas
export HOME=/home/andreas
export NODE_ENV=production
# Include the user-specific profile
. $HOME/.profile
exec /home/andreas/.nvm/versions/node/v18.18.0/bin/node JC-Backoffice/batchjobs/src/database-backup/backup-sqlite.js /home/andreas/database-backups
