# Setup Guide

## Database PostgreSQL

- Use PostgreSQL
- Create Database and setup `DATABASE_URL` in `.env`

## Cloud Storage

- Make Bucket
- Use Fine-grained access
- Setup Service Account with Storage Object Admin permission
- Save Service Account to `./src/application/ServiceAccountCloudStorage.json`

## Firebase Setup

### Firebase Admin

- Setup Service Account in Firebase Project Settings
- Save Service Account to `./src/application/ServiceAccountKey.json`

### Firebase App Web

- Go to Firebase Project Settings
- Add App
- Add Firebase to web app
- Import `firebaseConfig` to `./src/application/firebaseAuth.js`

## Running the Application

1. Install dependencies

```bash
npm install
```

2. Run database migrations

```bash
npx prisma migrate dev
```

3. Start the application

```bash
# Production mode
npm run start

# Development mode
npm run dev
```
