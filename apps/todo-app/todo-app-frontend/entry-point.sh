#!/bin/sh

sed -i "s|{{TODO_APP_API}}|$TODO_APP_API|g" /usr/share/nginx/html/app*.js
sed -i "s|{{TODO_APP_TITLE}}|$TODO_APP_TITLE|g" /usr/share/nginx/html/app*.js

exec "$@"