import { Storage } from "@google-cloud/storage";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountPath = path.resolve(__dirname, "../application/serviceAccountCloudStorage.json");

// Inisialisasi Google Cloud Storage
const storage = new Storage({
  projectId: "dermaseer",
  keyFilename: `${serviceAccountPath}`,
});

const bucketName = "tesdemas";
const cloudStorage = storage.bucket(bucketName);

export { cloudStorage };
