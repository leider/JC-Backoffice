#!/bin/sh
sudo svc -d /etc/service/JC-backoffice/
git pull
corepack enable
yarn install --immutable
yarn deploy
sudo svc -u /etc/service/JC-backoffice/
