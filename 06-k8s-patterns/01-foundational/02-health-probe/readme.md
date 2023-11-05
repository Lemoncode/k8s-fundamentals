# Health Probe

The *Health Probe* pattern is about how an application can communicate its health state to Kubernetes.

## Problem

Kubernetes regularly checks the container process status and restarts it if issues are detected. However, from practice, we know that checking the process status is not sufficient to decide about the health of an application. In many cases, an application hangs, but its process is still up and running. 

## Solution

Detect and recover.

## Process Health Check

A *process health* check is the simplest health check the `Kubelet` constantly performs on the container processes. If the container processes are not running, the container is restarted. So even without any other health checks, the application becomes slightly more robust with this generic check. If your application is capable of detecting any kind of failure and shutting itself down, the process health check is all you need.

## Liveness Probes

If your application runs into some deadlock, it is still considered healthy from the process health check’s point of view. To detect this kind of issue and any other types of failure according to your application business logic, Kubernetes has *liveness probes*—regular checks performed by the `Kubelet` agent that asks your container to confirm it is still healthy. 

Offers more flexibility regarding what methods to use for application health:

* HTTP - 200 - 399
* TCP - successful TCP connection
* exec - exit code 0

> NOTE: If the liveness probe fails `Kubelet` will restart the container.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: lieveness-check
  labels:
    name: lieveness-check
spec:
  containers:
  - name: lieveness-check
    image: jaimesalas/random-employee
    imagePullPolicy: Always
    env:
      - name: DELAY_STARTUP
        value: "20"
    resources: {}
    ports:
      - containerPort: 3000
    livenessProbe:
      httpGet: # 1
        path: /health
        port: 3000
      initialDelaySeconds: 30 # 2

```

1. HTTP probe
2. Initial delay before doing the first liveness check

```bash
kubectl apply -f ./liveness-probe.yml
```

After a period we can have a look into how the Pod looks like:

```bash
kubectl describe pod lieveness-check
```

We get 

```
# ...
Containers:
  lieveness-check:
    Container ID:   docker://66d54eb9c09c2c272ee484d43f9b6316db08fba703ed1be643056a6d94978930
    Image:          jaimesalas/random-employee
    Image ID:       docker-pullable://jaimesalas/random-employee@sha256:c99579d6f51e307434981357e3ed27cf917db52717924a9013af79c2a84f55fb
    Port:           3000/TCP
    Host Port:      0/TCP
    State:          Running
      Started:      Tue, 07 Sep 2021 16:51:29 +0200
    Ready:          True
    Restart Count:  0
    Liveness:       http-get http://:3000/health delay=30s timeout=1s period=10s #success=1 #failure=3
    Environment:
      DELAY_STARTUP:  20
    Mounts:
      /var/run/secrets/kubernetes.io/serviceaccount from kube-api-access-k4jmc (ro)
# ....
Events:
  Type    Reason     Age    From               Message
  ----    ------     ----   ----               -------
  Normal  Scheduled  9m59s  default-scheduler  Successfully assigned default/lieveness-check to minikube
  Normal  Pulling    9m59s  kubelet            Pulling image "jaimesalas/random-employee"
  Normal  Pulled     9m52s  kubelet            Successfully pulled image "jaimesalas/random-employee" in 6.178287406s
  Normal  Created    9m52s  kubelet            Created container lieveness-check
  Normal  Started    9m52s  kubelet            Started container lieveness-check
```

## Readiness Probes

Liveness checks are useful for keeping applications healthy by killing unhealthy containers and replacing them with new ones. But sometimes a container may not be healthy, and restarting it may not help either. The most common example is when a container is still starting up and not ready to handle any requests yet. Or maybe a container is overloaded, and its latency is increasing, and you want it to shield itself from additional load for a while.

For this kind of scenario, Kubernetes has readiness probes. The methods for performing readiness checks are the same as liveness checks (HTTP, TCP, Exec), but the corrective action is different. 

Rather than restarting the container, a failed readiness probe causes the container to be removed from the service endpoint and not receive any new traffic.

Readiness probes signal when a container is ready so that it has some time to warm up before getting hit with requests from the service. 

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: readiness-check
  labels:
    name: readiness-check
spec:
  containers:
  - name: readiness-check
    image: jaimesalas/random-employee
    imagePullPolicy: Always
    resources: {}
    readinessProbe:
      exec: # 1
        command: [
          "stat",
          "/opt/app/service-ready"
        ]

```

1. Checks the existence of a file.

```bash
kubectl apply -f ./readiness-probe.yml
```

Get the output by running:

```bash
kubectl describe pod readiness-check
```

We get 

```
# ....
Containers:
  readiness-check:
    Container ID:   docker://798e8e46ca281ee6a66f8cb69058cea87effbd8dcf92b384e50a2dac124fe656
    Image:          jaimesalas/random-employee
    Image ID:       docker-pullable://jaimesalas/random-employee@sha256:c2780cd7a9e2ae48be6f0cb42a09276d19720908978034137e698b8108e61d02
    Port:           <none>
    Host Port:      <none>
    State:          Running
      Started:      Tue, 07 Sep 2021 20:34:47 +0200
    Ready:          True
    Restart Count:  0
    Readiness:      exec [stat /opt/app/service-ready] delay=0s timeout=1s period=10s #success=1 #failure=3
    Environment:    <none>
    Mounts:
      /var/run/secrets/kubernetes.io/serviceaccount from kube-api-access-szfhh (ro)
# ....
Events:
  Type     Reason     Age    From               Message
  ----     ------     ----   ----               -------
  Normal   Scheduled  8m13s  default-scheduler  Successfully assigned default/readiness-check to minikube
  Normal   Pulling    8m12s  kubelet            Pulling image "jaimesalas/random-employee"
  Normal   Pulled     8m6s   kubelet            Successfully pulled image "jaimesalas/random-employee" in 6.80363202s
  Normal   Created    8m5s   kubelet            Created container readiness-check
  Normal   Started    8m5s   kubelet            Started container readiness-check
  Warning  Unhealthy  8m5s   kubelet            Readiness probe failed: stat: can't stat '/opt/app/service-ready': No such file or directory
```

It is up to your implementation of the health check to decide when your application is ready to do its job and when it should be left alone. While process health checks and liveness checks are intended to recover from the failure by restarting the container, the readiness check buys time for your application and expects it to recover by itself. 

In many cases, you have liveness and readiness probes performing the same checks. However, the presence of a readiness probe gives your container time to start up. 

For last logs are very important for as well, not to take immiediate actions, but for post morten.

It's important as well log the last will of containers, this is registered on `/dev/termination-log`.

We can find this file by running:

```bash
kubectl exec --stdin --tty readiness-check -- /bin/sh 
```

And then see its content by running:

```bash
cat /dev/termination-log
```

## Clean Up

```bash
kubectl delete -f ./liveness-probe.yml
kubectl delete -f ./readiness-probe.yml
```
