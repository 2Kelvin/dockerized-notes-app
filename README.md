# Dockerized Notes App

Implementing persistent storage for a Dockerized notes app

Run the multicontainer app:
```bash
docker compose up -d --build
```

Delete/Teardown the multicontainer app:
```bash
docker compose down
```

To tear down all the containers and delete the persistent volumes the app uses, run:
```bash
docker compose down --volumes
```