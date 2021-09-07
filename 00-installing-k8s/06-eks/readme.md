# EKS

`EKS` it's the AWS public cloud provider for `Kubernetes`. You can found the following official docs [here](https://docs.aws.amazon.com/eks/latest/userguide/getting-started.html), in this link, we will find out that we have to methods to get started with `EKS`, using the `AWS CLI` or `eksctl`. In our case we're going to use `eksctl` because it's the most straightforward method to have a K8s cluster running on AWS.

## Prerequisites

We need `v1.21.0`, follow the [link](https://docs.aws.amazon.com/eks/latest/userguide/install-kubectl.html) to upgrade your version

## Installing eksctl Linux

[Installation reference](https://eksctl.io/introduction/#installation)
[AWS Installation reference](https://docs.aws.amazon.com/eks/latest/userguide/eksctl.html)

**[To install or upgrade eksctl on Linux using curl]**

```bash
$ curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
```

```bash
$ sudo mv /tmp/eksctl /usr/local/bin
```

## Creating a cluster

To create a cluster with `eksctl`, we have two options, `Fargate` and `Managed node`, in our case, we will the second option, that will allow us to interact with via ssh with the worker nodes (EC2 instances).

### Create a key pair

```bash
$ aws ec2 create-key-pair --key-name eks-node-key --query 'EksNodeKey' > eks-node-key.pem
```

We have to grant permissions to the key:

```bash
$ chmod 400 eks-node-key.pem
```

We can display our key pair by running

```bash
$ aws ec2 describe-key-pairs --key-name eks-node-key
```

### Create the cluster

```bash
eksctl create cluster \
--name lc-cluster \
--version 1.21 \
--region eu-west-3 \
--nodegroup-name lc-nodes \
--node-type t2.small \
--nodes 3 \
--nodes-min 1 \
--nodes-max 4 \
--with-oidc \
--ssh-access \
--ssh-public-key eks-node-key \
--managed
```

> NOTE: Align the cluster region with your aws user settings

### View resources

```bash
kubectl get nodes -o wide
NAME                                           STATUS   ROLES    AGE     VERSION               INTERNAL-IP      EXTERNAL-IP      OS-IMAGE         KERNEL-VERSION                CONTAINER-RUNTIME
ip-192-168-2-42.eu-west-3.compute.internal     Ready    <none>   5m46s   v1.21.2-eks-c1718fb   192.168.2.42     15.237.24.145    Amazon Linux 2   5.4.129-63.229.amzn2.x86_64   docker://19.3.13
ip-192-168-40-230.eu-west-3.compute.internal   Ready    <none>   6m      v1.21.2-eks-c1718fb   192.168.40.230   35.180.29.45     Amazon Linux 2   5.4.129-63.229.amzn2.x86_64   docker://19.3.13
ip-192-168-83-71.eu-west-3.compute.internal    Ready    <none>   5m56s   v1.21.2-eks-c1718fb   192.168.83.71    15.236.247.143   Amazon Linux 2   5.4.129-63.229.amzn2.x86_64   docker://19.3.13
```

### Connecting to EC2 node

```bash
$ ssh -i ./eks-node-key.pem root@ec2-35-180-29-45.eu-west-3.compute.amazonaws.com
```

## Cleanup

```bash
$ eksctl delete cluster --name lc-cluster --region eu-west-3
```
