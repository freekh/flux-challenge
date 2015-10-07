#!/bin/sh
echo 'compiling...'
mkdir -p .tmp && mkdir -p dist && babel app.js > .tmp/app.js && browserify .tmp/app.js > dist/index.js && echo 'success!'
