#!/bin/sh
sudo svc -d /etc/service/JC-backoffice/
git pull
npm ci
grunt deploy
npm run build
npm run tsc
sudo svc -u /etc/service/JC-backoffice/
