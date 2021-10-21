#!/bin/bash
TAG=$1

set -x

docker build -f Dockerfile -t backend .

docker tag backend ${TAG}