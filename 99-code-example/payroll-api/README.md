# Payroll API

## Environment Variables

```ini
PORT=
```

* **PORT** - The port where the Application is listening for http

## Running Locally

Install dependencies

```bash
npm ci
```
Start up the application

```bash
npm run start:development
```

And check the API, by running:

```bash
curl localhost:3000/api/employee
```

## Building Container Image

```bash
docker build -t <your user>/payroll-api:<version> .
```

## Publishing the Image

```bash
docker login
```

```bash
docker push <your user>/payroll-api:<version>
```

Or running both by:

```bash
./build-push.sh "<your user>/payroll-api:<version>"
```
