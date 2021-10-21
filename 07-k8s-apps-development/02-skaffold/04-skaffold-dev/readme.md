# Using `skaffold dev`

Start from `04-from-dc-to-k8s-skaffold/01-skaffold-init`

Now let's try the following command:

```bash
skaffold dev -f skaffoldtest.yml
```

We have to wait for a while, unti the images are built, then at last we can see the following output:

```bash
Waiting for deployments to stabilize...
 - deployment/backend is ready. [1/2 deployment(s) still pending]
 - deployment/frontend is ready.
Deployments stabilized in 3.172 seconds
Press Ctrl+C to exit
Watching for changes...
[todo-app-backend] { Error: Cannot find module 'dotenv'
[todo-app-backend]     at Function.Module._resolveFilename (module.js:548:15)
[todo-app-backend]     at Function.Module._load (module.js:475:25)
[todo-app-backend]     at Module.require (module.js:597:17)
[todo-app-backend]     at require (internal/module.js:11:18)
[todo-app-backend]     at Object.<anonymous> (/home/node/app/server.js:7:18)
[todo-app-backend]     at Module._compile (module.js:653:30)
[todo-app-backend]     at Object.Module._extensions..js (module.js:664:10)
[todo-app-backend]     at Module.load (module.js:566:32)
[todo-app-backend]     at tryModuleLoad (module.js:506:12)
[todo-app-backend]     at Function.Module._load (module.js:498:3) code: 'MODULE_NOT_FOUND' }
[todo-app-backend] NODE ENV production, dotenv not init
[todo-app-backend] Todos API lsiten on port 3000
```

Now that we have this running let's make an update on code.

Update `./todo-app-frontend/src/components/todo-list.container.tsx`

```diff
return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
-     <Typography style={{ margin: 'auto', fontSize: '2rem' }}>
+     <Typography style={{ margin: 'auto', fontSize: '2.5rem' }}>
        The Awesome Todo App version: <span>{process.env.TODO_APP_TITLE}</span>
      </Typography>
      <TodoEditComponent createTodo={handleCreateTodo} />
      <TodoListComponent todos={todos} toggleDone={toggleTodo} />
    </div>
  );
```

We see that a new `skaffold process starts`, and if we do `kubectl get all`, we will notice a new replica set:

```
NAME                                  DESIRED   CURRENT   READY   AGE
replicaset.apps/backend-6464664d96    1         1         1       97m
replicaset.apps/frontend-5ffd76dccf   0         0         0       97m
replicaset.apps/frontend-85f94bc9ff   1         1         1       77s
```

The problem with this is, that it has to get throug all process for simple change on UI. Let's first cut the service (`ctrl + C`), we will notice that everything is clean up:

```
Cleaning up...
 - deployment.apps "backend" deleted
 - service "backend" deleted
 - deployment.apps "frontend" deleted
 - service "frontend" deleted
 - networkpolicy.networking.k8s.io "todo-network" deleted
```

If we run `kubectl get pods`, we will get `No resources found in default namespace.` 

The problem with this approach is not going to work for development, we need a way to avoid this long process.

[File Sync documentation](https://skaffold.dev/docs/pipeline-stages/filesync/)

> Exercise: Create a solution for this using above documentation.

### Other tools

* [draft](https://draft.sh)
* [tilt](https://tilt.dev)
* [garden](https://garden.io)