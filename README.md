# Pro Notes: Full-Stack Docker Containerized Application

This is a robust, production-ready Notes application featuring a React frontend, Node.js Express API, PostgreSQL database and Redis caching.

I designed this project to showcase my understanding on advanced Docker orchestration and container optimization techniques.

## Tech Stack

- **Frontend**: React
- **Backend**: Node.js, Express.js
- **Cache**: Redis (Key-value store for note caching)
- **Database**: PostgreSQL (Relational storage)
- **Reverse Proxy**: Nginx (Serving the React build)

## Docker Concepts Implemented

This project goes beyond basic `Dockerfile` creation, utilizing industry-standard patterns for security, speed and efficiency:

### 1. Multi-Stage Builds

Both the Frontend and Backend utilize multi-stage builds. This allowed me to use large builder images containing build tools and then copy only the necessary artifacts into a slim production-grade Alpine image.

- **Result**: Significantly smaller image sizes and a reduced attack surface.

### 2. Dependency Optimization (npm prune)

In the backend build, I ran `npm prune --production` before final packaging. This ensures that all `devDependencies` are excluded from the production image.

### 3. Docker Secrets Management

Rather than passing sensitive database passwords via insecure environment variables which can be leaked in logs or `docker inspect`, I used `Docker Secrets`.

- The password is read from a file on the host (**db-password.txt**) and mounted as a temporary file in memory at `/run/secrets/database_password` inside the container.

### 4. Resilient Service Discovery & Networking

- **Internal Communication**: The `Express API` communicates with `Redis` and `Postgres` using their service names (**redis**, **postgres_db**) defined in the `compose.yaml`.
- **Port Mapping**: The frontend is served via `Nginx` on port `8080`, while the API is gated behind port `5000`.

### 5. Persistent Data Volumes

PostgreSQL data is mapped to a named volume `all-notes-data`. This ensures that all app notes persist even if the containers are stopped, removed or updated.

## How To Run This Project Locally

### Prerequisites

- Install `Docker Desktop`.
- Create a file named `db-password.txt` in the project's root directory containing your desired Postgres DB password.

## Project Structure

```bash
.
├── backend/            # Express API & Dockerfile (Multi-stage)
├── frontend/           # React App, Nginx config & Dockerfile (Multi-stage)
├── compose.yaml        # Main Docker orchestration file
├── db-password.txt     # Local secret for Postgres DB password (Git ignored)
└── volumes/            # Persistent DB storage (Managed by Docker)
```

### Deployment

Run this command to build and start the entire app stack:

```bash
docker compose up -d --build
```

The application will be live and available at:

- **Frontend**: `http://localhost:8080`
- **Backend API**: `http://localhost:5000`

## Tear down

To delete the running app containers only, run:

```bash
docker compose down
```

To tear down all the containers and delete the persistent volumes the app uses, run:

```bash
docker compose down --volumes
```
