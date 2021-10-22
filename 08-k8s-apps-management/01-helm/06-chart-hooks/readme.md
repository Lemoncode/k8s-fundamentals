# Chart Hooks 

Helm provides a hook mechanism to allow chart developers to intervene at certain points in a release's life cycle.

Hooks work like regular templates, but they have special annotations that cause Helm to utilize them differently. In this section, we cover the basic usage pattern for hooks.

## The Available Hooks

* `pre-install` -	Executes after templates are rendered, but before any resources are created in Kubernetes
* `post-install` - Executes after all resources are loaded into Kubernetes
* `pre-delete` - Executes on a deletion request before any resources are deleted from Kubernetes
* `post-delete` -	Executes on a deletion request after all of the release's resources have been deleted
* `pre-upgrade` -	Executes on an upgrade request after templates are rendered, but before any resources are updated
* `post-upgrade` -	Executes on an upgrade request after all resources have been upgraded
* `pre-rollback` -	Executes on a rollback request after templates are rendered, but before any resources are rolled back
* `post-rollback`	Executes on a rollback request after all resources have been modified
* `test` -	Executes when the Helm test subcommand is invoked ( view test docs)