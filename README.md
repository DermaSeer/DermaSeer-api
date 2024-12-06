# Bangkit 2024 Batch 2 Capstone Team C242-PS189
# DermaSeer API - Cloud Computing

## Table of Contents 📝
1. [Overview](#overview-)
2. [Getting Started](#getting-started-%EF%B8%8F)
3. [Setup Guide](#setup-guide-)
    - [Clone the repo](#1-clone-the-repo-)
    - [Deploy Machine Learning Model API & VertexAI Models](#2-deploy-machine-learning-model-api--vertexai-models-)
    - [Database PostgreSQL](#3-database-postgresql-%EF%B8%8F)
    - [Cloud Storage](#4-cloud-storage-%EF%B8%8F)
    - [Firebase Setup](#5-firebase-setup-)
    - [Running the Application](#6-running-the-application-)
4. [env Configuration](#env-configuration-%EF%B8%8F)
5. [API Endpoints](#api-endpoints-)


# Overview 🌐
- *DermaSeer API* is an app that analyzes skin condition images using machine learning that provide diagnoses and use AI-powered to get product recommendations.

## Contributor

| Name                        | Bangkit-ID     | Github-Profile                                       | LinkedIn                                          |
|-----------------------------|----------------|-----------------------------------------------------|--------------------------------------------------|
| Rojak Kurniawan   | C318B4KY3957   | [@rojakkurniawan](https://github.com/rojakkurniawan)         | [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/rojakkurniawan/) |
| Muhammad Rizqi Faadhilah            | C318B4KY3071   | [@mr-fadh](https://github.com/mr-fadh)             | [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/muhammad-rizqi-faadhillah/) |


# Getting Started 🛠️

## Tech stack
![NodeJS](https://img.shields.io/badge/-NodeJS-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/-Express-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/-Prisma-2D3748?logo=prisma&logoColor=white)
![Firebase](https://img.shields.io/badge/-Firebase-FFCA28?logo=firebase&logoColor=white)
![Docker](https://img.shields.io/badge/-Docker-2496ED?logo=docker&logoColor=white)
![Google Cloud Storage](https://img.shields.io/badge/-Google_Cloud_Storage-4285F4?logo=google-cloud&logoColor=white)
![Google Cloud Run](https://img.shields.io/badge/-Google_Cloud_Run-4285F4?logo=google-cloud&logoColor=white)
![Google Cloud Artifact Registry](https://img.shields.io/badge/-Google_Cloud_Artifact_Registry-4285F4?logo=google-cloud&logoColor=white)
![Google Vertex AI](https://img.shields.io/badge/-Google_Vertex_AI-4285F4?logo=google-cloud&logoColor=white)


# Setup Guide 🧑‍💻

## 1. Clone the Repo 📩
- Ensure you are on the right or your *desired directory*.
```bash
git clone https://github.com/DermaSeer/DermaSeer-api.git
```


## 2. Deploy Machine Learning Model API & VertexAI Models 🤖

- Machine Learning Model API
  - Ensure that you already have the machine learning model deployed. You can follow the instructions in the [*DermaSeer-Model-API*](https://github.com/DermaSeer/DermaSeer-model-api).
  - Save the deployed model URL to the .env file.
  ```bash
  # example: https://dermaseer-ml-api-id.asia-southeast2.run.app
  MODEL_API_URL=""
  ```

- VertexAI Models
  - Ensure that you have the VertexAI models deployed. You can deploy [*our selected HuggingFace models on VertexAI*](https://console.cloud.google.com/vertex-ai/publishers/google/model-garden/gemma-2b-it;hfSource=true;action=deploy).
  - Save the VertexAI model endpoint details to the .env file.
  ```bash
  # Vertex AI Model Endpoint
  VERTEX_AI_PROJECT_ID=""
  VERTEX_AI_LOCATION=""
  VETEX_AI_ENDPOINT_ID=""
  ```


## 3. Database PostgreSQL 🗄️

- PostgreSQL Installation
  - Ensure you have PostgreSQL installed on your machine. You can download it from [PostgreSQL official website](https://www.postgresql.org/download/).
- Create Database
  - Create a new PostgreSQL database for the project.
  ```bash
  CREATE DATABASE [db_name]
  ```

- Configure .env file
  - Use PostgreSQL
  - Create Database and setup DATABASE_URL in .env
  ```env
  DATABASE_URL=postgresql://username:password@localhost:5432/[db_name]
  ```


## 4. Cloud Storage ☁️

- Create a Storage Bucket
  - Create a storage bucket on *Google Cloud Platform*.
  - Save the bucket name to the .env file.
  ```bash
  # Google Cloud Storage
  GOOGLE_CLOUD_PROJECT_ID=""
  GOOGLE_CLOUD_BUCKET_NAME=""
  ```
- Fine-Grained Access Control
  - Ensure that you enable *Fine-grained access control* for your bucket.
- Service Account Permissions
  - Create a Service Account in Google Cloud IAM with *Storage Object Admin* permissions.
  - Download the Service Account JSON key file
- Save Credentials
  - Save the downloaded Service Account credentials file to:
  ```bash
  ./src/application/credentials/cloudStorage.json
  ```


## 5. Firebase Setup 🔥

- Firebase Admin
  - Go to your Firebase project settings.
  - Under *Service Accounts*, generate a new private key.
  - Save the Firebase Admin Service Account JSON file to:
  ```bash
  ./src/application/credentials/firebaseAdmin.json
  ```
- Firebase App Web
  - In Firebase project settings, click *General* then add a new *Web App*.
  - Copy the Firebase configuration object.
  - Save the Firebase configuration object to ./src/application/firebaseAuth.js
  *Example of firebaseAuth.js :*
  ```js
  const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
  };
  ```


## 6. Running the Application 🚀

- Local Development
  - Install dependencies
      ```bash
      npm install
      ```
  - Run database migrations
      ```bash
      npx prisma migrate
      ```
  - Start the application
      ```bash
      # Production mode
      npm run start
  
      # Development mode
      npm run dev
      ```
- Docker Deployment
  - Build docker image
      ```bash
      docker build -t dermaseer-api:1.0.0 .
      ```
  - Run the container
      ```bash
      docker run -d -p 5001:5001 --name backend dermaseer-api:1.0.0
      ```
- Google Cloud Run Deployment
  - Create Artifact Registry Repository
      ```bash
      gcloud artifacts repositories create dermaseer \
      --repository-format=docker \
      --location=asia-southeast2
      ```
  - Set Up Environment Variables
      ```bash
      # Set your project ID
      export GOOGLE_CLOUD_PROJECT=your-project-id
      
      # Set your region
      export REGION=asia-southeast2
  
      # Set your service name
      export SERVICE_NAME=dermaseer-api
  
      # Setu your Artifact Registry Repository
      export ARTIFACT_REPO=dermaseer
      ```
  - Build and push docker image to Artifact Registry
      ```bash
      gcloud builds submit --tag asia-southeast2-docker.pkg.dev/${GOOGLE_CLOUD_PROJECT}/${ARTIFACT_REPO}/dermaseer-api:1.0.0
      ```
  - Deploy to Cloud Run
      ```bash
      gcloud run deploy ${SERVICE_NAME} \
      --image asia-southeast2-docker.pkg.dev/${GOOGLE_CLOUD_PROJECT}/${ARTIFACT_REPO}/dermaseer-api:1.0.0 \
      --platform managed \
      --region ${REGION} \
      --allow-unauthenticated \
      --port 5001
      ```
Once the installation is complete:
- Access the application at http://localhost:5001 or the provided Cloud Run URL.
- Take a look at the [API documentation](#api-endpoints) to interact with the endpoints.


## env Configuration ⚙️

| Variable                  | Description                                           |
|---------------------------|-------------------------------------------------------|
| DATABASE_URL             | Connection string for the PostgreSQL database         |
| PORT                     | Port number for the Express.js server                 |
| GOOGLE_CLOUD_PROJECT_ID  | Google Cloud project ID                               |
| GOOGLE_CLOUD_BUCKET_NAME | Name of Google Cloud Storage bucket                       |
| MODEL_API_URL            | URL for the external model API (e.g., deployed on Google Cloud Run) |
| VERTEX_AI_PROJECT_ID     | Google Cloud project ID for Vertex AI                 |
| VERTEX_AI_LOCATION       | Location for the Vertex AI model                      |
| VERTEX_AI_ENDPOINT_ID    | Endpoint ID for the deployed Vertex AI model          |



## API Endpoints 📡
You can also explore and interact with these endpoints directly using our Postman collection:
[*Postman API Documentation*](https://docs.dermaseer.com/)
