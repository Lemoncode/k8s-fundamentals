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