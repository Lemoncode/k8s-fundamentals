## Before start

[Accessing apps](https://minikube.sigs.k8s.io/docs/handbook/accessing/)

In order to test this deployment we must use, `minikube tunnel`, this will expose a pulic IP, thats the IP that we have to point to in `curl-loop.sh`.

Start `minikube tunnel` in a separate terminal.

## Rolling Update Deployment Instructions

Create `curl-loop.sh`

```bash
EXTERNAL_IP=$1

for ((i=1;i<=100;i++))
do
    curl -s "http://$EXTERNAL_IP" | grep "<title>.*</title>"
    sleep 2s
done

# -s for silent mode

```

```bash
$ chmod +x curl-loop.sh
```

Create `nginx.service.yml`

```yml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  type: LoadBalancer
  selector:
    app: my-nginx
  ports:
  - port: 80
    targetPort: 80

```

Create `nginx.deployment.yml`

```yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-nginx
  labels:
    app: my-nginx
spec:
  replicas: 4
  minReadySeconds: 1 # Default 0
  progressDeadlineSeconds: 60 # Default 600s
  revisionHistoryLimit: 5 # Default 10
  strategy:
    type: RollingUpdate # This is the default
    rollingUpdate:
      maxSurge: 1 # Default 25%
      maxUnavailable: 1 # Default 25%
  selector:
    matchLabels:
      app: my-nginx
  template:
    metadata:
      labels:
        app: my-nginx
    spec:
      containers:
      - name: my-nginx
        image: nginx:1.16.1-alpine #nginx:1.17.8-alpine
        # image: nginx:1.17.8-alpine
        resources:
          limits:
            memory: "128Mi" #128 MB
            cpu: "200m" #200 millicpu (.2 cpu or 20% of the cpu)
        ports:
        - containerPort: 80

```


1. Deploy the Deployment and Service by running the following command:

```bash
$ kubectl create -f ./ --save-config --record
```

Locate the public IP on load balancer

```bash
$ kubectl get svc
```

Now we can try on browser by using

```bash
http://REPLACE_WITH_EXTERNAL_IP
```

2. Run `kubectl get all` and notice that 4 Pods, 1 Deployment, and 1 ReplicaSett have successfully been deployed.

3. Open a separate command window and run the following script:

```bash
$ sh curl-loop.sh EXTERNAL_IP
```

4. Change the image version in `nginx.deployment.yml` to the one shown in the comment right next to it. Save the file.

5. Run the following command to apply the new Deployment:

```bash
$ kubectl apply -f nginx.deployment.yml --record
```

6. Go back and check the curl commands being made by the script and you should see the interruption in the service. This demonstrates a Rolling Deployment in action.

7. Check the Deployment status by running the following:

```bash
$ kubectl rollout status deployment my-nginx
```

We will get something like this:

```bash
Jaimes-MacBook-Pro:rolling-update jaimesalaszancada$ kubectl rollout status deployment my-nginx  Waiting for deployment "my-nginx" rollout to finish: 1 old replicas are pending termination...
Waiting for deployment "my-nginx" rollout to finish: 1 old replicas are pending termination...
Waiting for deployment "my-nginx" rollout to finish: 1 old replicas are pending termination...
Waiting for deployment "my-nginx" rollout to finish: 3 of 4 updated replicas are available...
Waiting for deployment "my-nginx" rollout to finish: 3 of 4 updated replicas are available...
deployment "my-nginx" successfully rolled out
```

8. Delete all created resources and remove possible minikube orphaned routes by `minikube tunnel --cleanup`

### Clenaup

> Do it after the next demo


