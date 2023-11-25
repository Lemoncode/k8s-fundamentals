# Init Container Demo

## Steps

Create a new file `init-pod.yaml`

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: lc-init
  labels:
    app: initializer
spec:
  initContainers:
    - name: init-ctr
      image: busybox
      command: [
        'sh',
        '-c',
        'until nslookup lemoncode-svc; do echo waiting for lemoncode-svc service; sleep 1; done; echo Ready'
      ]
  containers:
  - name: web-ctr
    image: jaimesalas/web-app
    resources: {}
    ports:
      - containerPort: 8080

```

Reviewing this yaml we will find out the `initContainers` section

```yaml
initContainers:
    - name: init-ctr
      image: busybox
      command: [
        'sh',
        '-c',
        'until nslookup lemoncode-svc; do echo waiting for lemoncode-svc service; sleep 1; done; echo Ready'
      ]
```

Any containers defined here in this array will run on complete successfully before the regular app containers, can start.  In this case, we only have just one container.


```yaml
containers:
  - name: web-ctr
    image: jaimesalas/web-app
    resources: {}
    ports:
      - containerPort: 8080
```

Remember you can define as many init containers as we want. They will run sequentally, If any of them spits an error, the chain is stopped, and the pod gets restarted.

`init-ctr` (the init container), is watching `lemoncode-svc` to be available, until it's not ready will be hang up there, on an infinite loop. Once the `dns` give us a response, the loop will stop. The `Kubelet`, will move to the next step, start up the application's containers.

Let's start up the pod and se what happen

```bash
kubectl apply -f init-pod.yaml
```

Now if we have a look into `pods` resource, we will find out:

```bash
kubectl get pods --watch
```

```
NAME      READY   STATUS     RESTARTS   AGE
lc-init   0/1     Init:0/1   0          15s
```

Remember that `init-ctr` is writing to `stdout`, we can have a look on that, open a new terminal and run:

```bash
kubectl logs lc-init -c init-ctr
```

`lc-init` reference to the pod that we want to access to its logs, `-c` flag references to the exact container that we want to access.

We must see a similar output as follows:

```
...
** server can't find lemoncode-svc.default.svc.cluster.local: NXDOMAIN

*** Can't find lemoncode-svc.svc.cluster.local: No answer
*** Can't find lemoncode-svc.cluster.local: No answer
*** Can't find lemoncode-svc.default.svc.cluster.local: No answer
*** Can't find lemoncode-svc.svc.cluster.local: No answer
*** Can't find lemoncode-svc.cluster.local: No answer

waiting for lemoncode-svc service
Server:         10.96.0.10
Address:        10.96.0.10:53
...
```

Let's create the service, and start it, to make that application's containers can start up. Create `init-svc.yaml`

```yml
apiVersion: v1
kind: Service
metadata:
  name: lemoncode-svc
spec:
  type: LoadBalancer
  selector:
    app: initializer
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
```

Let's deploy the service

```bash
kubectl apply -f init-svc.yaml
```

After a while, if we have a look into our pods resource we will find out:

```bash
kubectl get pods --watch
```

We get the following output:

```
NAME      READY   STATUS     RESTARTS   AGE
lc-init   0/1     Init:0/1   0          87s
lc-init   0/1     PodInitializing   0          2m44s
lc-init   1/1     Running           0          2m47s
```

We can use `describe` to see all the phases:

```bash
kubectl describe pods lc-init
```

```
# ....
Events:
  Type    Reason     Age    From               Message
  ----    ------     ----   ----               -------
  Normal  Scheduled  6m52s  default-scheduler  Successfully assigned default/lc-init to minikube
  Normal  Pulling    6m51s  kubelet            Pulling image "busybox"
  Normal  Pulled     6m50s  kubelet            Successfully pulled image "busybox" in 1.383903306s
  Normal  Created    6m50s  kubelet            Created container init-ctr
  Normal  Started    6m50s  kubelet            Started container init-ctr
  Normal  Pulling    4m8s   kubelet            Pulling image "jaimesalas/web-app"
  Normal  Pulled     4m6s   kubelet            Successfully pulled image "jaimesalas/web-app" in 2.015882014s
  Normal  Created    4m6s   kubelet            Created container web-ctr
  Normal  Started    4m6s   kubelet            Started container web-ctr
```

If we want to see our app running in a local browser we can run:

```bash
minikube tunnel
```

## Summary

In this example, we used a single init container to prevent the main app container from starting until something else in the environment was configured and up for us. Here was an LoadBalancer service, but it could be whatever, another app or an external API.

## Clenaup

```bash
kubectl delete service lemoncode-svc
kubectl delete pod lc-init
```
