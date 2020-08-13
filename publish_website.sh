#!/usr/bin/env bash
echo "Publish website using Janet"

echo "Installing and using node"
export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"
nvm use

echo "Install website dependencies"
yarn --cwd './website'

echo "Build website"
yarn --cwd './website' run build

echo "Publish using Janet"
yarn --cwd './website' run publish-janet
