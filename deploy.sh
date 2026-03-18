#!/bin/bash

# PRODUCTION
git reset --hard
git checkout main
git pull origin main

# docker compose up -d

npm i
npm run build
pm2 start process.config.js --env production

# DEVELOPMENT
# git reset --hard
# git checkout develop
# git pull origin develop

# npm i
# # pm2 start process.config.js --env development
# pm2 start "run start:dev" --name=Fenzo 

# chmod +x deploy.sh
# -rwxr-xr-x    1 plass  staff     337 Mar 17 02:40 deploy.sh ==> READ, WRITE, EXECUTE 