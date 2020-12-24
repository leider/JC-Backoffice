#!/bin/sh
sudo svc -d /etc/service/JC-backoffice/
git pull
npm run ci-all-modules
npm run deploy
sudo svc -u /etc/service/JC-backoffice/
