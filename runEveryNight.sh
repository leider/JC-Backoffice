#!/bin/sh
cd /home/andreas

exec 2>&1
export USER=andreas
export HOME=/home/andreas
export NODE_ENV=production
export NODE_ICU_DATA=$HOME/JC-Backoffice/node_modules/full-icu
# Include the user-specific profile
. $HOME/.profile
# exec node --icu-data-dir=/home/andreas/JC-Backoffice/node_modules/full-icu JC-Backoffice/start.js
exec node JC-Backoffice/batchjobs/src/index.js
