Vercel Clone – Automated Frontend Deployment Platform

This project is a lightweight clone of Vercel, designed to automate the deployment of frontend applications directly from a Git repository. It provides a scalable, real-time CI/CD workflow where users can trigger builds, stream logs, and preview deployed outputs—all with minimal manual effort.

🔧 Key Features
GitHub Integration: Automatically clones frontend projects from Git repositories.

Containerized Build System: Each deployment runs in an isolated Docker container managed by AWS ECS (Fargate).

Live Build Logs: Real-time log streaming using Redis Pub/Sub and Socket.IO.

Dynamic CI/CD Pipeline: Builds projects using npm install and npm run build, then uploads artifacts to AWS S3.

Instant Preview URLs: Serves deployed projects via a reverse proxy mapped to unique subdomains.

Scalable Cloud Architecture: Uses AWS ECS, S3, and Redis for seamless scalability and performance.

**Setup Guide**

This Project contains following services and folders:

* api-server: HTTP Server for REST APIs
* build-server: Docker Image that clones, builds and pushes the build to S3
* s3-reverse-proxy: Reverse Proxy the subdomains and domains to s3 bucket static assets

**Local Setup**

1. Run npm install in all the 3 services i.e. api-server, build-server and s3-reverse-proxy
2. Docker build the build-server and push the image to AWS ECR.
3. Setup the api-server by providing all the required config such as TASK ARN and CLUSTER arn.
4. Run node index.js in api-server and s3-reverse-proxy

Following services would be up and running:

**Service : PORT** 

api-server	:9000

socket.io-server	:9002

s3-reverse-proxy	:8000

ARCHITECTURE
<img width="1689" height="753" alt="Screenshot 2025-07-16 111510" src="https://github.com/user-attachments/assets/825ca3ab-554f-4499-a2e9-563e84f1701a" />
