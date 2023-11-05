# Managed Lifecycle

Containerized applications managed by cloud-native applications have no control over their lifecycle, they have to listen to the events emitted by the managing platform.

The *Managed Lifecycle* pattern describes how applications can react (and should) react to these lifecycle events.

## Problem

It is up to the containerized application to determine which events are important to react to and how to react. But in effect, this is an API that the platform is using to communicate and send commands to the application. Also, applications are free to either benefit from lifecycle management or ignore it if they don’t need this service.

## Solution

Using only the process model to run and stop a process is not good enough. Real-world applications require more fine-grained interactions and lifecycle management capabilities. Some applications need help to warm up, and some applications need a gentle and clean shutdown procedure.

* Events emitted by K8s:
    - PreStop (API)
    - PostStart (API)
    - SIGTERM
    - SIGKILL

## SIGTERM Signal

Whenever Kubernetes decides to shut down a container, whether that is because the Pod it belongs to is shutting down or simply a failed liveness probe causes the container to be restarted, the container receives SIGTERM. SIGTERM is a gentle way for the container to shut down cleanly before Kubernetes sends a more abrupt SIGKILL signal. Once a SIGTERM signal has been received, the application should shut down as quickly as possible. For some applications, this might be a quick termination, and some other applications may have to complete their in-flight requests, release open connections, and clean up temp files, which can take a slightly longer time. In all cases, reacting to SIGTERM is the right moment to shut down a container in a clean way.

## SIGKILL Signal

If a container process has not shut down after a SIGTERM signal, it is shut down forcefully by the following SIGKILL signal. Kubernetes waits 30 seconds to send SIGKILL. The grace period can be de defined per Pod, using `.spec.terminationGracePeriodSeconds`

## Postart Hook

Using only process signals for managing lifecycles is limited. That is why there are additional lifecycle hooks such as `postStart` and `preStop`.

```yml
apiVersion: v1
kind: Pod
metadata:
  name: post-start
  labels:
    name: post-start
spec:
  containers:
  - name: post-start
    image: jaimesalas/random-employee
    resources:
      limits: {}
    lifecycle:
      postStart:
        exec:
          command: # 1
            - sh
            - -c
            - sleep 15 
            - echo "Start Up" > /tmp/postStart_done

```

1. The `postStart` command waits here 15 seconds. `sleep` is just a simulation for any lengthy startup code that might run here. It uses a trigger file here to sync with the main application, which starts in parallel.

The `postStart` command is executed after a container is created, asynchronously with the primary container’s process.

The `postStart` action is a blocking call, and the container status remains *Waiting* until the `postStart` handler completes, which in turn keeps the Pod status in the *Pending* state. This can be used to delay the startup of the application container.

Another use is to prevent a container from starting when the Pod does not fulfill certain preconditions. When `postStart` indicates an error the main container process gets killed.

* `postStart` and `preStop` invocation are similar to *Health Probes*
    - *exec* - Runs a command directly in the container.
    - *httpGet* - HTTP GET against by one Pod container

## Prestop Hook

The `preStop` hook is a blocking call sent to a container before it is terminated. It has the same semantics as the SIGTERM signal and should be used to initiate a graceful shutdown of the container when reacting to SIGTERM is not possible.

```yml
apiVersion: v1
kind: Pod
metadata:
  name: pre-stop
  labels:
    name: pre-stop
spec:
  containers:
  - name: pre-stop
    image: jaimesalas/random-employee
    imagePullPolicy: Always
    volumeMounts:
    - mountPath: /tmp
    resources: {}
    lifecycle:
      preStop:
        httpGet: # 1
          port: 3000
          path: /shutdown

```

1. Call out to a `/shutdown` endpoint running within the application.

```bash
kubectl apply -f ./pre-stop.yml
```

## Other Lifecycle Controls

## References

https://stackoverflow.com/questions/46123457/restart-container-within-pod
https://github.com/kubernetes/kubernetes/issues/55807
https://devopspoints.com/kubernetes-health-checks.html
https://blog.risingstack.com/graceful-shutdown-node-js-kubernetes/
https://expressjs.com/en/advanced/healthcheck-graceful-shutdown.html
