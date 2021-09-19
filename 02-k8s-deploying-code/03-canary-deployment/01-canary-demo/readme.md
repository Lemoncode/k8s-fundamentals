## Steps

### 1. Prepare solutions

Unzip `canary-app.zip` and `stable-app.zip`, on the root directory and as sibling of both directories create `docker-compose.yml`

```yml
version: '3.7'

services:

  stable:
    container_name: stable-app
    image: jaimesalas/stable-app
    build:
      context: ./stable-app
      dockerfile: Dockerfile
    ports:
      - 9000:80
  
  canary:
    container_name: canary-app
    image: jaimesalas/canary-app
    build:
      context: ./canary-app
      dockerfile: Dockerfile
    ports:
      - 9001:80

```
Run `docker-compose build` to build the images that will be used for Canary testing.

### 2. Create the Kubernetes Service, Stable Deployment, and Canary Deployment manifests

Create `stable.service.yml`

```yml
apiVersion: v1
kind: Service
metadata:
  name: stable-service
  labels:
    app: aspnetcore
spec:
  type: LoadBalancer
  selector:
    app: aspnetcore
  ports:
  - port: 80
    targetPort: 80


```

Create `stable.deployment.yml` 

```yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: stable-deployment
spec:
  replicas: 4
  selector:
    matchLabels:
      app: aspnetcore
      track: stable
  template:
    metadata:
      labels:
        app: aspnetcore
        track: stable
    spec:
      containers:
      - name: stable-app
        image: jaimesalas/stable-app
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 80
        readinessProbe:
          httpGet:
            path: /
            port: 80
        resources: {}

```

Create `canary.deployment.yml`

```yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: canary-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: aspnetcore
      track: canary
  template:
    metadata:
      labels:
        app: aspnetcore
        track: canary
    spec:
      containers:
      - name: canary-app
        image: jaimesalas/canary-app
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 80
        readinessProbe:
          httpGet:
            path: /
            port: 80
        resources: {}

```

### 3. Running the Canary Deployment

1. Create the Kubernetes Service, Stable Deployment, and Canary Deployment by running the following command:

    `kubectl apply -f ./`

    Note: You'll get an error about `docker-compose.yml` but can ignore it (it's not a valid Kubernetes file of course).

2. In a new terminal, run `minikube tunnel` to publish the load balancer, run `kubectl get srv`, and using the published `EXTERNAL-IP` visit `http://EXTERNAL-IP`

3. Run the following command: `sh curl-loop.sh <EXTERNAL-IP>`

4. Because the Stable Deployment has 4 replicas and the Canary Deployment only has 1, the output should show Stable app output most of the time. If you don't see Canary app show up at all run the command again.

5. Clean `kubectl delete -f ./` and `minikube tunnel --cleanup`
