#!/bin/bash
IMAGE=$1

set +x
echo building Image ${IMAGE}
docker build --build-arg API_MOCK=false -f ./.docker/nginx.dockerfile -t ${IMAGE} .

echo pushing Image ${IMAGE}
docker push ${IMAGE}
