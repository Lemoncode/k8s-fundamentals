#!/bin/bash
IMAGE=$1

set +x
echo building Image ${IMAGE}
docker build -t ${IMAGE} .


echo pushing Image ${IMAGE}
docker push ${IMAGE}
