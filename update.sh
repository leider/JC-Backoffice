#!/bin/sh
sudo svc -d /etc/service/JC-backoffice/
git pull
npm ci
npm run deploy
sudo svc -u /etc/service/JC-backoffice/
