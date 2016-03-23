#!/usr/bin/env bash

ORIGIN=https://williamkapke:$GITHUB_TOKEN@github.com/williamkapke/node-compat-table.git

echo 'pulling latest...'
git pull $ORIGIN

node versions.js > .versions

git add .versions

if [[ `git status -s` == '' ]]; then
  echo 'No changes';
  exit 1;
fi

echo
echo 'Saving versions...'
git commit -am 'Auto Update Node Versions'
git push $ORIGIN gh-pages

