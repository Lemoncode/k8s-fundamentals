# EKS

`EKS` it's the AWS public cloud provider for `Kubernetes`. You can found the following official docs [here](https://docs.aws.amazon.com/eks/latest/userguide/getting-started.html), in this link, we will  find out that we have to methods to get started with `EKS`, using the `AWS CLI`  or `eksctl`. In our case we're going to use `eksctl` because it's the most straightforward method to have a K8s cluster running on AWS. 

## Prerequisites

We need `v1.21.0`, follow the [link](https://docs.aws.amazon.com/eks/latest/userguide/install-kubectl.html) to upgrade your version

## Installing eksctl

[Installation reference](https://eksctl.io/introduction/#installation)
[AWS Installation reference](https://docs.aws.amazon.com/eks/latest/userguide/eksctl.html)

**[To install or upgrade eksctl on Linux using curl]**

```bash
$ curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
```

```bash
$ sudo mv /tmp/eksctl /usr/local/bin
```