TAG=$1

docker build -t ${TAG} .

docker push ${TAG}