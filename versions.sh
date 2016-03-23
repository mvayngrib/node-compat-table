#!/usr/bin/env bash

ORIGIN=https://williamkapke:$GITHUB_TOKEN@github.com/williamkapke/node-compat-table.git

echo 'downloading latest...'
rm -rf ./.temp
git clone $ORIGIN .temp

mkdir -p ./.temp/results
cd ./.temp
git config user.email "william.kapke@gmail.com"
git config user.name "William Kapke"

node versions.js > .versions

git add .versions

if [[ `git diff --name-only --cached` == '' ]]; then
  echo 'No changes';
  exit 1;
fi

echo
echo 'Saving versions...'
git commit -am 'Auto Update Node Versions'
git push $ORIGIN gh-pages

