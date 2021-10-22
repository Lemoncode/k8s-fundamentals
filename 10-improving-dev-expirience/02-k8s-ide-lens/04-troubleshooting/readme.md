# Troubleshooting

We can connect to the node using `shell`

[accessing node shell](./resources/accessing-node-shell.png)

And for example journal kubelet

```bash
sudo journalctl -u kubelet
```

We can also select Pods, extract their logs and create an interactive terminal with them.