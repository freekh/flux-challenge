while inotifywait -qq -qre close_write app.js
  mkdir -p .tmp; and mkdir -p dist; and babel app.js > .tmp/app.js; and browserify .tmp/app.js > dist/index.js
end
