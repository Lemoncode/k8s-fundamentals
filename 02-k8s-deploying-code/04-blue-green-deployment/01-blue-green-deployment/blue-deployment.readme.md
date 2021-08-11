# Blue-Green Deployments - The Blue Deployment Demo

Once we have [published our image](01-blue-green-deployment/blue/readme.md)

```bash
$ export TARGET_ROLE=blue
$ export IMAGE_VERSION=jaimesalas/nginx-blue
```

K8s don't have token replacement engine that's why we're using `sed`.

```bash
sed 's,\$TARGET_ROLE,'$TARGET_ROLE',g' |
sed 's,\$IMAGE_VERSION,'$IMAGE_VERSION',g' |
tee
```

```bash
$ cat nginx.deployment.yml | sh config.sh | kubectl create --save-config -f -
```

```bash
$ kubectl get all
NAME                                        READY   STATUS    RESTARTS   AGE
pod/nginx-deployment-blue-9cb9b4f66-4l4nx   1/1     Running   0          37s
pod/nginx-deployment-blue-9cb9b4f66-nvpbm   1/1     Running   0          37s

NAME                 TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
service/kubernetes   ClusterIP   10.96.0.1    <none>        443/TCP   4d13h

NAME                                    READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/nginx-deployment-blue   2/2     2            2           37s

NAME                                              DESIRED   CURRENT   READY   AGE
replicaset.apps/nginx-deployment-blue-9cb9b4f66   2         2         2       37s
```

Now we have to create a public service for call this deployment, on this public service we're doing variable replacement.

```bash
$ cat nginx.service.yml | sh config.sh | kubectl create --save-config -f -
```

```bash
$ kubectl get svc
NAME            TYPE           CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
kubernetes      ClusterIP      10.96.0.1       <none>        443/TCP        4d13h
nginx-service   LoadBalancer   10.108.65.197   <pending>     80:31661/TCP   114s
```

> Run `minikube tunnel` on a new terminal

Now if we want to call this on a different way we could with this hardcoded option.

```bash
$ kubectl create -f nginx-blue-test.service.yml
```
    
```bash
$ kubectl get svc
NAME              TYPE           CLUSTER-IP      EXTERNAL-IP     PORT(S)          AGE
kubernetes        ClusterIP      10.96.0.1       <none>          443/TCP          4d13h
nginx-blue-test   LoadBalancer   10.96.248.49    10.96.248.49    9000:31902/TCP   15s
nginx-service     LoadBalancer   10.108.65.197   10.108.65.197   80:31661/TCP     4m16s
```

To get the public one `10.108.65.197`

To get the blue test `10.96.248.49:9000`

