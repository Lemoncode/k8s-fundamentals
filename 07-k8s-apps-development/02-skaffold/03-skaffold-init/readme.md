# Using `skaffold init`

Start from `03-from-dc-to-k8s-skaffold/01-convert-todo-app`

If we already have the K8s manifests, from root solution we can run:

```bash
skaffold init -k '.k8s/*.yml' \
 -a '{"builder": "Docker","payload": {"path": "./todo-app-api/Dockerfile"},"image": "todo-app-backend"}' \
 -a '{"builder": "Docker","payload": {"path": "./todo-app-frontend/Dockerfile"},"image": "todo-app-frontend"}'
```

If instead we wna to use `docker-compose.yml`

```bash
skaffold init --compose-file docker-compose.yml -f skaffoldtest.yml \
 -a '{"builder": "Docker","payload": {"path": "./todo-app-api/Dockerfile"},"image": "todo-app-backend"}' \
 -a '{"builder": "Docker","payload": {"path": "./todo-app-frontend/Dockerfile"},"image": "todo-app-frontend"}'
```

## Steps 

### 1. Running with `docker-compose.yml`

```bash
skaffold init --compose-file docker-compose.yml -f skaffoldtest.yml \
 -a '{"builder": "Docker","payload": {"path": "./todo-app-api/Dockerfile"},"image": "todo-app-backend"}' \
 -a '{"builder": "Docker","payload": {"path": "./todo-app-frontend/Dockerfile"},"image": "todo-app-frontend"}'
```

With `-f` flag, we can specify the `Skaffold` file.

We get the following output:

```
WARN[0000] Skipping Jib: no JVM: [java -version] failed: exec: "java": executable file not found in $PATH  subtask=-1 task=DevLoop
apiVersion: skaffold/v2beta24
kind: Config
metadata:
  name: --skaffold-init
build:
  artifacts:
  - image: todo-app-backend
    context: todo-app-api
    docker:
      dockerfile: Dockerfile
  - image: todo-app-frontend
    context: todo-app-frontend
    docker:
      dockerfile: Dockerfile
deploy:
  kubectl:
    manifests:
    - backend-deployment.yaml
    - backend-service.yaml
    - frontend-deployment.yaml
    - frontend-service.yaml
    - todo-network-networkpolicy.yaml

? Do you want to write this configuration to skaffoldtest.yml? (y/N)
```

What is saying is that from this `docker-compose.yml` will become these `manifests`. Hit `y`.

This will genarate a bunch of yaml files, lets create a new directory and save those files:

```bash
mkdir .k8s
```

```bash
mv ./*.yaml .k8s 
```

Let's have a deeper close into `skaffoldtest.yml`

```yml
apiVersion: skaffold/v2beta24
kind: Config
metadata:
  name: --skaffold-init
build: # 1 - start
  artifacts:
  - image: todo-app-backend
    context: todo-app-api
    docker:
      dockerfile: Dockerfile
  - image: todo-app-frontend
    context: todo-app-frontend
    docker:
      dockerfile: Dockerfile # 1 - end
deploy:
  kubectl:
    manifests:
    - backend-deployment.yaml
    - backend-service.yaml
    - frontend-deployment.yaml
    - frontend-service.yaml
    - todo-network-networkpolicy.yaml

```

1. We have a set of images that we need to build.

Now we're going to change and point to `.k8s`, because we have moved or files there:

Update `skaffoldtest.yaml`

```diff
# ....
deploy:
  kubectl:
    manifests:
-     - backend-deployment.yaml
-     - backend-service.yaml
-     - frontend-deployment.yaml
-     - frontend-service.yaml
-     - todo-network-networkpolicy.yaml
+     - .k8s/*.yaml

```