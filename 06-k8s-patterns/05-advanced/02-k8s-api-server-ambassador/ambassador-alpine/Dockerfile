FROM alpine

ARG ARCH="amr64"

RUN apk update && \
    apk add curl && \
     curl -LO https://storage.googleapis.com/kubernetes-release/release/`curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt`/bin/linux/$ARCH/kubectl && \
     chmod +x ./kubectl && \
     mv ./kubectl /usr/local/bin/kubectl
    
COPY ambassador.sh  /ambassador.sh 

RUN chmod +x /ambassador.sh 

ENTRYPOINT /ambassador.sh