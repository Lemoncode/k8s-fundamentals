#!/bin/bash
TAG=$1

set -x

docker build -f Dockerfile -t frontend .

docker tag frontend ${TAG}