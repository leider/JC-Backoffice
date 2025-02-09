#!/bin/sh

docker run --name local-jc -p 1969:1969\
 -v /Users/leider/Dev/JavascriptDev/JC-Backoffice/config-docker:/home/node/config \
 -v /Users/leider/Dev/JavascriptDev/JC-Backoffice/db:/home/node/db \
 -v /Users/leider/Dev/JavascriptDev/Agora-Wiki:/home/node/wiki \
 -v '/Users/leider/Dev/JavascriptDev/JC-Backoffice/pdfs\ and\ more':/home/node/pdfs \
 -v /Users/leider/Dev/JavascriptDev/JC-Backoffice/exposedfiles:/home/node/exposedfiles \
 -d derleider/jazzclub
