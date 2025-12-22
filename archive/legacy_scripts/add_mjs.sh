#!/bin/bash
sed "8s/application\/javascript\s\+js;/application\/javascript                           js mjs;/" /etc/nginx/mime.types > /tmp/mime.types.new
cp /tmp/mime.types.new /etc/nginx/mime.types
