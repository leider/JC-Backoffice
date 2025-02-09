
FROM node:18-slim
RUN apt update
RUN apt-get install git-all -y --no-install-recommends
RUN mkdir -p /home/node/app

WORKDIR /home/node/app/
COPY runtime-deploy/ ./

RUN yarn workspaces focus --production --all
RUN git config --global user.email "docker@jazzclub.de"
RUN git config --global user.name "DOCKER"
EXPOSE 1969

CMD ["node", "start"]
