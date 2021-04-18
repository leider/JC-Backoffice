#!/bin/sh
sudo svc -d /etc/service/JC-backoffice/
git pull
yarn install --frozen-lockfile
yarn deploy
sudo svc -u /etc/service/JC-backoffice/
