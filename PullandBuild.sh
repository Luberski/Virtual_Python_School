#!/bin/bash

pm2 delete all
pkill gunicorn

cd /var/www/html
git pull

cd Front-End/
npm i
npm run build
#pm2 start npm --name "virtual-school" -- start # Nie działa uruchomione przez shell script

#cd Back-End/
#gunicorn --daemon  --bind 0.0.0.0:5000 app:app