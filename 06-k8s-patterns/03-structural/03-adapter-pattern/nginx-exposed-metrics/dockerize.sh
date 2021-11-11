IMAGE=$1

docker build -t $IMAGE .
docker push $IMAGE
