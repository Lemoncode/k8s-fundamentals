# Salary service migration

In this example we are going to migrate `salary` service (from [99-code-example](../../99-code-example/graalvm/salary)) to use `buildpacks`.

## Steps
1. Copy all the content of [salary service folder](../../99-code-example/graalvm/salary) into a new directory named `salary-buildpacks`.
2. Delete Docker files since they are not needed anymore: `Dockerfile` & `.dockerignore`.
3. **Select a builder**. To build an app it is necessary to decide which builder is to be used. When using `pack` it is possible to execute a command to retrieve a list of suggested builders: `pack builder suggest`.
4. **Build the app**. Now that the builder has been chosen, it's time to build the app: `pack build jtrillo/salary-buildpacks --path salary-buildpacks/ --builder`