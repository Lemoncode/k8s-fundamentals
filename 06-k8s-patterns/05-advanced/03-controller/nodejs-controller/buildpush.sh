#!/bin/sh
TAG=$1
ARCH=$2

if [ $ARCH ]; then
    echo building image with ${ARCH} architecture
    docker build -t ${TAG} --build-arg ARCH=${ARCH} .
else
    docker build -t ${TAG} .    
fi 

# ./buildpush.sh jaimesalas/nodejs-controller
docker push ${TAG}