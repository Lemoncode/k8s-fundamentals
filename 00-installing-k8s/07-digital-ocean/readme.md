# Desplegar un clúster de K8s en Digital Ocean

En esta demo vamos a desplegar un clúster de K8s en el proveedor público de cloud Digital Ocean. Dentro del respositorio proveeremos de una VM para evitar instalaciones locales en nuestra máquina.

## Pre requisitos

Debemos tener una cuenta en Digital Ocean, si no tenemos cuenta, podemos seguir el siguiente [enlace](https://cloud.digitalocean.com/registrations/new)

## Pasos

## 1. Nos registramos en la VM (opcional)

```bash
vagrant ssh
```

## 2. Instalamos doctl

La manera más semcilla de instalar `doctl` es a través del gestor de paquetes `snap`

```bash
sudo snap install doctl
```

## 3. Crear un API token

Debemos crear un API token para nuestra cuenta con permisos de lectura / escritura sobre [Applications & API Page](https://cloud.digitalocean.com/account/api/tokens?i=41c8c7)

## 4. Usar el token para dar acceso a nuestra cuenta a doctl

> Si hemos instalado `doctl` usando Ubuntu Snap puede que necesitemos crear el directorio de configuración de usuario si no existe `~/.config`

```bash
mkdir ~/.config
```

Usamos el API token cuando se nos solicite al iniciar la autorización con `doctl`, a este conetexto de autorización hay que darle un nombre:

```bash
doctl auth init --context <NAME>
```

Para el desarrollo de esta demo usaremos `k8s-demo`. Si el `token` es correcto, deberíamos ver el siguiente `output`:

```bash
Please authenticate doctl for use with your DigitalOcean account. You can generate a token in the control panel at https://cloud.digitalocean.com/account/api/tokens

Enter your access token: 
Validating token... OK
```

Una cuestión importante, si hemos inicializado un contexto, se generará uno nuevo además del `default`. 

```bash
doctl auth list
```

Obteniendo en nuestro caso:

```
default (current)
k8s-demo
```

Recordar que hemos inicializado la autorización contra `k8s-demo`, por lo que si intentamos cualquier acción contra Digital Ocean, obtendremos un error de permisos.

```bash
doctl auth switch --context k8s-demo
```

```bash
Now using context [k8s-demo] by default
```


## 5. Válidamos que `doctl` está funcionando

```bash
doctl account get
```

## 6. Instalamos kubectl


```bash
curl -LO https://dl.k8s.io/release/v1.22.0/bin/linux/amd64/kubectl
```

```bash
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
```

```bash
kubectl version --client
```

## 7. Creamos el clúster de K8s en Digital Ocean

Para crear el clúster en Digital Ocean ejecutaremos el siguiente comando:

```bash
doctl kubernetes cluster create lc-demo
```

Después de uno 20 - 30 minutos veremos:

```
Notice: Cluster is provisioning, waiting for cluster to be running
.....................................................................................................
Notice: Cluster created, fetching credentials
Notice: Adding cluster credentials to kubeconfig file found in "/home/vagrant/.kube/config"
Notice: Setting current-context to do-nyc1-lc-demo
ID                                      Name       Region    Version        Auto Upgrade    Status     Node Pools
d83167bc-ccb0-4c61-87f8-f8752096475e    lc-demo    nyc1      1.21.9-do.0    false           running    lc-demo-default-pool
```

Y podemos comprobar los nodos usando:

```bash
kubectl get nodes
```

```
NAME                         STATUS   ROLES    AGE     VERSION
lc-demo-default-pool-uie29   Ready    <none>   5m32s   v1.21.9
lc-demo-default-pool-uie2z   Ready    <none>   5m56s   v1.21.9
lc-demo-default-pool-uiepn   Ready    <none>   5m56s   v1.21.9
```

## Clean up

```bash
doctl kubernetes cluster delete lc-demo 
```

## Referencias

[How to install and Configure doctl](https://docs.digitalocean.com/reference/doctl/how-to/install/)
[How to Create a Personal Access Token](https://docs.digitalocean.com/reference/api/create-personal-access-token/)
[doctl kubernetes cluster create](https://docs.digitalocean.com/reference/doctl/reference/kubernetes/cluster/create/)
[doctl kubernetes cluster delete](https://docs.digitalocean.com/reference/doctl/reference/kubernetes/cluster/delete/)