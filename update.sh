#!/bin/sh
git pull
npm install
npm update
npm prune
git checkout -- package-lock.json
grunt deploy_production
npm run build
sudo svc -du /etc/service/JC-backoffice/
