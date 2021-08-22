
## Linux

```bash
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

In our case we are going to install `1.21.0` to align with the required version by AWS EKS.

```bash
curl -LO https://storage.googleapis.com/minikube/releases/v1.21.0/minikube-linux-amd64
```

To verify that minikube it's working run:

```bash
$ minikube start
```

## References

[minikube get started](https://minikube.sigs.k8s.io/docs/start/)
