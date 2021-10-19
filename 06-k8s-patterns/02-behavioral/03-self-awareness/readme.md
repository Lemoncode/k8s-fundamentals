# Self Awareness

Some applications need to be self-aware and require information about themselves. The Self Awareness pattern describes the Kubernetes Downward API that provides a simple mechanism for introspection and metadata injection to applications.

## Self Aweraness Use cases

* Modify the application on runtime depending on assigned resources
  * Application threead-pool
  * Change the GC algorithm
  * Use pod name for loggin information
  * Discover other pods with the same label and the same namespace 

> For these, Kubernetes provides the `Downward API`.

## Downward API

The Downward API allows passing metadata about the Pod to the containers and the cluster through environment variables and files.

### Demo: Using Downward API

[Demo: Using Downward API](01-downward-api/readme.md)

###  Downward API information available in `fieldRef.fieldPath`

| Name                       | Description                             |
| -------------------------- | --------------------------------------- |
| spec.nodeName              | Name of the node hosting the Pod        |
| status.hostIP              | IP address of node hosting the Pod      |
| metadata.name              | Pod name                                |
| metadata.namespace         | Namespace in which the Pod is running   |
| status.podIP               | Pod IP address                          |
| spec.serviceAccountName    | ServiceAccount that is used for the Pod |
| metadata.uid               | Unique ID of the Pod                    |
| metadata.labels['key']     | Value of Pod's label key                |
| metadata.annotation['key'] | Value of the Pod's annotation key       |

### Downward API information available in `resourceFieldRef.resource`

| Name            | Description                  |
| --------------- | ---------------------------- |
| requests.cpu    | A container's CPU request    |
| limits.cpu      | A container's CPU limit      |
| limits.memory   | A container's memory request |
| requests.memory | A container's memory limit   |

We can change labels and annotations while a Pod is running. Unless the pod is restarted, environment variables will not reflect that change.

`downwardAPI` volumes can do it.