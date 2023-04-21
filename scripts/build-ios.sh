#!/usr/bin/env bash

set -e

echo -e '\nStart building iOS design tokens...'
npm i && npx gulp buildIos

echo 'Finish building iOS design tokens...'