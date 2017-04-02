#!/bin/sh
git pull
npm install
npm prune
grunt deploy_production
sudo svc -du JC-backoffice/
