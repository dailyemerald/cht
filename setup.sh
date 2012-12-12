#!/bin/bash

echo "adding heroku-config plugin"
heroku plugins:install git://github.com/ddollar/heroku-config.git

echo "setting up .env"
touch .env
