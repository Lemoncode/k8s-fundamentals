# Setting contexts

```bash
minikube start
```

```bash
kubectl config get-contexts
```

The output will show the current contexts that we can use:

```bash
CURRENT   NAME                                                       CLUSTER                                                    AUTHINFO                                                   NAMESPACE
          arn:aws:eks:eu-west-3:092312727912:cluster/lemoncode-eks   arn:aws:eks:eu-west-3:092312727912:cluster/lemoncode-eks   arn:aws:eks:eu-west-3:092312727912:cluster/lemoncode-eks   
*         minikube                                                   minikube                                                   minikube                                                   default
```

If we want to set the `eks` cluster, we can do this by running:

```bash
# set the current context to the AWS context
kubectl config use-context arn:aws:eks:eu-west-3:092312727912:cluster/lemoncode-eks
```

Recall from [demo automated local K8s setup](00-installing-k8s/04-automated-local-k8s-setup) that we were accessing to our cluster inside the master node, if we want to access from the host we can do it by editing `~/.kube/config`.

Notice that after running the cluster locally a new directory has been generated creating a `00-installing-k8s/04-automated-local-k8s-setup/configs/config`, change directory to `00-installing-k8s` and run:

```bash
cp ./04-automated-local-k8s-setup/configs/config $HOME/.kube
```

Ensure that the **local VMs cluster is running** and run:

```bash
kubectl config get-contexts
```

The output is

```bash
CURRENT   NAME                          CLUSTER      AUTHINFO           NAMESPACE
*         kubernetes-admin@kubernetes   kubernetes   kubernetes-admin  
```

```bash
kubectl get nodes
```

The output is

```bash
NAME            STATUS   ROLES                  AGE    VERSION
master-node     Ready    control-plane,master   114m   v1.21.4
worker-node01   Ready    worker                 112m   v1.21.4
worker-node02   Ready    worker                 108m   v1.21.4
```

If we run again `minikube start`, and run 

```bash
kubectl config get-contexts
```

The output is

```bash
CURRENT   NAME                          CLUSTER      AUTHINFO           NAMESPACE
          kubernetes-admin@kubernetes   kubernetes   kubernetes-admin   
*         minikube                      minikube     minikube           default
```

And if we run `kubectl get nodes` we get:

```
kubectl get nodes
NAME       STATUS   ROLES                  AGE   VERSION
minikube   Ready    control-plane,master   34h   v1.20.7
```

Now for last we can run:

```bash
kubectl config use-context kubernetes-admin@kubernetes
```

And we will be changing the `kubectl context`

```bash
kubectl get nodes
NAME            STATUS   ROLES                  AGE    VERSION
master-node     Ready    control-plane,master   120m   v1.21.4
worker-node01   Ready    worker                 118m   v1.21.4
worker-node02   Ready    worker                 114m   v1.21.4
```