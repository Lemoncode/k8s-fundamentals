# Random Employee Servcie

The random employee service generates a random employee, is an API, that wraps `faker.js`

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
curl localhost:3000/employees/random
```

## Building Container Image

```bash
docker build -t <your user>/random-employee:<version> .
```

## Publishing the Image

```bash
docker login
```

```bash
docker push <your user>/random-employee:<version>
```

Or running both by:

```bash
./build-push.sh "<your user>/random-employee:<version>"
```
