# Getting started

## Prerequisites

* Docker
* minikube
* kubectl
* Skaffold

## Steps

### 1. Create the application file

Create `main.go` and place it on root directory solution

```go
package main

import (
	"fmt"
	"time"
)

func main() {
	for {
		fmt.Println("Spooky hollow!")
		
		time.sleep(time.Second * 1)
	}
}
```

### 2. Create Dockerfile

Create `Dockerfile` and place it on root directory solution

```Dockerfile
FROM golang:1.15 as builder

COPY main.go .

# `skaffold debug` sets SKAFFOLD_GO_GCFLAGS to disable compiler optimizations
ARG SKAFFOLD_GO_GCFLAGS
RUN go build -gcflags="${SKAFFOLD_GO_GCFLAGS}" -o /app main.go

FROM alpine:3
# Define GOTRACEBACK to mark this container as using the Go language runtime
# for `skaffold debug` (https://skaffold.dev/docs/workflows/debug/).
ENV GOTRACEBACK=single
CMD ["./app"]
COPY --from=builder /app .
```

### 3. Create Skaffold manifest

Create `skaffold.yaml` and pace it on root directory solution

```yaml
apiVersion: skaffold/v2beta24
kind: Config
build:
  artifacts:
  - image: skaffold-example
deploy:
  kubectl:
    manifests:
      - k8s-*
```

> TODO: Explain skaffold manifest

### 4. Create deployment manifest

## References

[Quickstart](https://skaffold.dev/docs/quickstart/)
