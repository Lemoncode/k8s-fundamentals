# Building Helm Charts

## Helm Charts Structure

The `chart` **is a directory that can also be compressed as an archive**. By convention, the folder name has the name of the **chart**. The **chart properties are stored** in a `Chart.yaml` file. **In it you can find the chart name, chart version, and other metadata**.

```
chart-demo/
├─ Chart.yaml
├─ templates/
│  ├─ deployments.yaml
│  ├─ _helpers.tpl
│  ├─ ingress.yaml
│  ├─ service.yaml
├─ values.yaml
```

If your chart has subcharts or depends on external charts, you can either add them as archives in the charts subfolder or reference them as dependencies in the `Chart.yaml` file or in the `requirements.yaml` file:

```
chart-demo/
├─ charts/
│  ├─ mongodb-7.8.4.tgz
├─ Chart.yaml
├─ requirements.yaml
├─ templates/
│  ├─ deployments.yaml
│  ├─ _helpers.tpl
│  ├─ ingress.yaml
│  ├─ service.yaml
├─ values.yaml
```

The chart can be documented in a `README.md` file. The `LICENSE` file, is optional, contains the license of the chart.

To display some information to the user after your chart is installed or updated, for example, some useful information such as what to do next, the URL and port numbers of your services, or a quick howto, this can be added in `NOTES.txt`.

Another component that could be considered part of the documentation is the `values.schema.json` file, which defines the structure of the `values.yaml` file.

```
chart-demo/
├─ Chart.yaml
├─ LICENSE
├─ README.md
├─ templates/
│  ├─ deployments.yaml
│  ├─ _helpers.tpl
│  ├─ ingress.yaml
│  ├─ NOTES.txt
│  ├─ service.yaml
├─ values.schema.json
├─ values.yaml
```

Now gets a deeper look into `Chart.yaml`

```yaml
# Chart.yaml
apiVersion: v2 # 5.
name: chart-demo # 1.
description: A Helm chart for Kubernetes # 2.
keywords: # 3.
  - demo
type: application # 4.
appVersion: 1.16.0 # 6.
version: 0.1.0 # 7.
dependencies: ...
```

1. Name of the Chart
2. An optional description
3. Useful to find the Chart on a repository
4. We can use between `library` and `application`
5. This is the Helm version `v2` maps to `Helm 3`
6. Version of the application you plan to install with Helm. It can be any version number or string.
7. The version of the `Chart`. It has to follow semantic version 2.0 specifications with a patch, minor, and major number.

> Note that the appVersion and chart version are not related.

- You could **have a new appVersion if your app changes** but **keep the same chart version because the chart structure and templates remain the same**.
- Or you could have the opposite, the **same application version** but a **new chart version because the chart files changed**.

The `Chart.yaml` file also contains the dependencies configuration.

## Demo: Deploying Frontend

[Demo: Deploying Frontend](./01-deploying-frontend/readme.md)

## Demo: Building a Helm Chart

[Demo: Building a Helm Chart](./02-building-helm-chart/01-creating-chart.md)

## Defining Helm Concepts

The chart is the definition of our application. When the chart is installed in the Kubernetes cluster by hand, we say that a release is running, so the **chart is the definition of the application and the release is an instance of the chart running in the Kubernetes cluster**.

If you made some change in your application and want to install it, you don't have to install a new release. **Instead, you can update an existing release and make a new revision of that release. This is another important concept in Helm, release revision. This is not considered as a new release, it's a new revision of the same release.**

> Don't confuse `release revision` with the `chart version` that we saw previously in the `Chart.yaml` file. The chart version refers to a change in the chart's file structure, meaning a change in the application definition. For example, if there are new Kubernetes objects like a service account and a persistent volume, the chart structure changes so the chart version should also change.

`release revision` refers to a change in the running instance of that chart, either because the chart itself changed and the release was updated or simply because the chart did not change, but the same chart version is installed with different values.

## Main Commands

|             Action             |              Command              |
| :----------------------------: | :-------------------------------: |
|       Install a Release        |   helm install [release][chart]   |
|   Upgrade a Release revision   |   helm upgrade [release][chart]   |
| Rollback to a Release revision | helm rollback [release][revision] |
|     Print Release history      |      helm history [release]       |
|     Display Release status     |       helm status [release]       |
|   Show Details of a Release    |      helm get all [release]       |
|      Uninstall a Release       |     helm uninstall [release]      |
|         List Releases          |             helm list             |

- `helm install` - installs a chart as a release.

- `helm upgrade` - upgrades a release to a new revision.

- `helm rollback` - rolls backs a release to a previous revision. For example, if you find a bug and want to go back to the previous revision.

- `helm history` - lists the revision history of a release.

- `helm status` - displays the status of a release, which objects are installed, and their running status.

- `helm get` - shows the details of a release manifest and current values.

- `helm uninstall` - uninstalls a release from the Kubernetes cluster. Note that in Helm 2 we use helm delete instead of helm install.

- `helm list` - lists all release names with some basic information.

## Demo: Installing a Helm Chart

[Demo: Installing a Helm Chart](./02-building-helm-chart/02-installing-chart.md.md)

## Demo: Deploying Full App

[Demo: Deploying Full App](./03-deploying-full-app/readme.md)

## Umbrella Chart

> TODO: Add a definition for Umbrella Chart

## Demo: Building an Umbrella Helm Chart

[Demo: Building an Umbrella Helm Chart](./04-building-umbrella-chart/readme.md)
[Demmo: Building Umbrella Chart](./04-building-umbrella-chart/readme.md)
