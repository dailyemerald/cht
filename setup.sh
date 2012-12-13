#!/bin/bash

echo "Adding heroku-config plugin to push/pull config vars"
heroku plugins:install git://github.com/ddollar/heroku-config.git

