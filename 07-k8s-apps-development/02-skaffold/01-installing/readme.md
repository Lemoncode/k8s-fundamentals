# Installing Skaffold

Skaffold installation is pretty straighforward, is a simple binary that we will add to `PATH` in our machine.

## Linux

Depending on our machine architecture we will have to choose between different versions: `amd64` or `arm64`. 

```bash
# For Linux x86_64 (amd64)
curl -Lo skaffold https://storage.googleapis.com/skaffold/releases/latest/skaffold-linux-amd64
```

Or 

```bash
# For Linux ARMv8 (arm64)
curl -Lo skaffold https://storage.googleapis.com/skaffold/releases/latest/skaffold-linux-arm64
```

Once the binary is downloaded, we have to move to `/usr/local/bin`

```bash
sudo install skaffold /usr/local/bin/
```


## Reeferences

[Installing Skaffold Guidelines](https://skaffold.dev/docs/install/)
