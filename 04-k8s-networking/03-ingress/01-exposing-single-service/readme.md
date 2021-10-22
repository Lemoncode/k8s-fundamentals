## Environment

Using local K8s via minikube 

If you are running K8s locally using `Docker Desktop`, you can install the ingress using the following link[https://kubernetes.github.io/ingress-nginx/deploy/#docker-desktop]

## Check the status of the pods to see if the ingress controller is online

```bash
$ kubectl get pods  --namespace ingress-nginx
NAME                                        READY   STATUS      RESTARTS   AGE
ingress-nginx-admission-create-sp68d        0/1     Completed   0          55d
ingress-nginx-admission-patch-4j767         0/1     Completed   1          55d
ingress-nginx-controller-59b45fb494-h664t   1/1     Running     17         55d
```

## Now let's check to see if the service is online. This of type NodePort and no EXTERNAL IP is provided yet 

```bash
$ kubectl get services --namespace ingress-nginx
NAME                                 TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)                      AGE
ingress-nginx-controller             NodePort    10.111.158.122   <none>        80:32044/TCP,443:30669/TCP   55d
ingress-nginx-controller-admission   ClusterIP   10.109.191.104   <none>        443/TCP                      55d
```

## Let's expose our first service

```bash
#Create a deployment, scale it to 2 replicas and expose it as a service
#This service will be ClusterIP and we'll expose this service via the Ingress
kubectl create deployment hello-world-service-single --image=gcr.io/google-samples/hello-app:1.0
kubectl scale deployment hello-world-service-single --replicas=2
kubectl expose deployment hello-world-service-single --port=80 --target-port=8080 --type=ClusterIP
```

Now we can create a single Ingress routing to the one backend service port 80 listening on all hostnames, create `ingress-single.yaml`

```yml
apiVersion: networking.k8s.io/v1
kind: Ingress 
metadata:
  name: ingress-single
spec:
  defaultBackend:
    service:
        name: hello-world-service-single
        port:
          number: 80
```

```bash
#Create single Ingress routing to the one backend service on the service port 80 listening on all hostnames
$ kubectl apply -f ingress-single.yaml
```

Now we can check that is working by running:

```bash
$ kubectl get ingress --watch
NAME             CLASS    HOSTS   ADDRESS        PORTS   AGE
ingress-single   <none>   *       192.168.64.6   80      40s
```

```bash
$ kubectl get ingress
NAME             CLASS    HOSTS   ADDRESS        PORTS   AGE
ingress-single   <none>   *       192.168.64.6   80      20m
```

```bash
#Notice the backends are the Service's Endpoints...so the traffic is going straight from the Ingress Controller to the Pod cutting out the kube-proxy hop.
#Also notice, the default backend is the same service, that's because we didn't define any rules and
#we just populated ingress.spec.backend. We're going to look at rules next...
$ kubectl describe ingress ingress-single
Name:             ingress-single
Namespace:        default
Address:          192.168.64.6
Default backend:  hello-world-service-single:80 (172.17.0.4:8080,172.17.0.5:8080)
Rules:
  Host        Path  Backends
  ----        ----  --------
  *           *     hello-world-service-single:80 (172.17.0.4:8080,172.17.0.5:8080)
Annotations:  <none>
Events:
  Type    Reason  Age                From                      Message
  ----    ------  ----               ----                      -------
  Normal  Sync    16m (x2 over 16m)  nginx-ingress-controller  Scheduled for sync
```

```bash
$ curl 192.168.64.6
Hello, world!
Version: 1.0.0
```
