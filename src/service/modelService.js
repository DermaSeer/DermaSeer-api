import { prismaClient } from "../application/database.js";
import { PredictionServiceClient } from "@google-cloud/aiplatform";
import { helpers } from "@google-cloud/aiplatform";
import { ResponseError } from "../error/responseError.js";
import { validate } from "../validation/validation.js";
import axios from "axios";
import { admin } from "../application/firebaseAdmin.js";
import { predictionValidation, recommendedValidation, getProductRecommendationValidation, vertexAIValidation, getPredictionByIdValidation } from "../validation/modelValidation.js";
import { getUserValidation } from "../validation/userValidation.js";
import path from "path";
import { cloudStorage } from "../application/cloudStorage.js";
import { nanoid } from "nanoid";
import { extname } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CREDENTIALS_PATH = path.resolve(__dirname, "../application/credentials/vertexAI.json");
process.env.GOOGLE_APPLICATION_CREDENTIALS = CREDENTIALS_PATH;

function parseJSON(text) {
  try {
    try {
      const parsedJSON = JSON.parse(text);
      return parsedJSON;
    } catch (e) {}

    const jsonBlockRegex = /```json\n([\s\S]*?)\n```/;
    const match = text.match(jsonBlockRegex);

    const jsonContent = match[1];

    const parsedJSON = JSON.parse(jsonContent);

    return parsedJSON;
  } catch (error) {
    throw new Error("Failed to get recommendation, please try again, code 1");
  }
}

const predictModel = async (authHeader, userData, request, file) => {
  const req = validate(predictionValidation, { ...request, image: file });
  const decodedToken = validate(getUserValidation, userData);

  const userRecord = await admin.auth().getUser(decodedToken.uid);
  const uid = userRecord.uid;

  if (!req) {
    throw new ResponseError(400, "Invalid input");
  }

  if (decodedToken.uid !== uid) {
    throw new ResponseError(404, "User not found");
  }

  let image_url = null;

  async function makePredict(image_url) {
    const data = JSON.stringify({
      img_url: image_url,
    });

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${process.env.MODEL_API_URL}/api/predict`,
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      data: data,
    };

    try {
      const response = await axios.request(config);
      return response.data.data.predicted_acne_type;
    } catch (error) {
      throw new ResponseError(500, "Failed to get prediction");
    }
  }

  try {
    const fileName = `${nanoid()}${extname(file.originalname)}`;
    const destination = `predict/${fileName}`;
    const cloudFile = cloudStorage.file(destination);

    const stream = cloudFile.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    await new Promise((resolve, reject) => {
      stream.on("error", (err) => {
        reject(new ResponseError(400, err.message));
      });

      stream.on("finish", async () => {
        let makeFilePublic;
        try {
          [makeFilePublic] = await cloudFile.makePublic();
        } catch (e) {
          reject(new ResponseError(500, "Please try again later"));
        }
        image_url = `https://storage.googleapis.com/${makeFilePublic.bucket}/${makeFilePublic.object}`;
        resolve();
      });

      stream.end(file.buffer);
    });

    const acne_type = await makePredict(image_url);

    if (!acne_type) {
      throw new ResponseError(500, "Failed to get prediction result");
    }

    const model_predict = await prismaClient.modelPredict.create({
      data: {
        user_id: uid,
        image_url: image_url,
        acne_type: acne_type,
      },
    });

    const data = {
      predict_id: model_predict.id,
      acne_type: acne_type,
      image_url: model_predict.image_url,
    };

    return {
      status: true,
      message: "Successfully predicted acne type",
      data: data,
    };
  } catch (e) {
    throw new ResponseError(e.status || 500, e.message);
  }
};

const vertexAIRecommendation = async (req) => {
  req = validate(recommendedValidation, req);

  if (!req) {
    throw new ResponseError(400, "Invalid input");
  }

  const predict_id = req.predict_id;

  const predict = await prismaClient.modelPredict.findUnique({
    where: { id: predict_id },
    select: {
      id: true,
      acne_type: true,
    },
  });

  if (!predict) {
    throw new ResponseError(404, "Predict ID not found");
  }

  const predictCheck = await prismaClient.modelResult.findFirst({
    where: { predict_id: predict_id },
  });

  if (predictCheck) {
    throw new ResponseError(400, "Recommendation already exists");
  }

  const projectId = process.env.VERTEX_AI_PROJECT_ID;
  const location = process.env.VERTEX_AI_LOCATION;
  const endpointId = process.env.VETEX_AI_ENDPOINT_ID;

  const prompt = `
Kamu adalah seorang dokter skincare, Berikan output HANYA JSON SEPERTI CONTOH DI BAWAH, Tolong berikan rekomendasi bahan pembersih wajah yang aman dan efektif berdasarkan:
- Jenis Kulit: ${req.skin_type}
- Kondisi Jerawat: ${predict.acne_type}
- Kategori Produk: ${req.product_category}

Catatan:
- Fokus pada bahan yang terbukti efektif
- Pertimbangkan interaksi antar bahan
- Berikan Langsung Enter saja
- Jangan Berikan PENJELASAN/EXPLANATION/CATATAN/ANALISIS/DLL diluar dari apa yang diminta
- Output Hanya JSON dan 1 kali jawaban saja
- message wajib menggunakan bahasa indonesia

Ketentuan:
1. Berikan minimal 15 bahan yang bermanfaat
2. Cantumkan nama utama bahan saja
3. Hindari bahan yang memperburuk
4. Sertakan panduan perawatan kulit di message

Contoh Respon Yang Diharapkan (JSON):
{
  "data": {
    "ingredient": [
      "bahan1",
      "bahan2",
      "..."
    ],
    "message": "Penjelasan Perawatan nya dari deskripsi jenis kulit, kondisi jerawatnya dan produk dan bahan yang mungkin di butuhkan dengan kondisi tersebut"
  }
}
`;

  const instances = [
    {
      inputs: prompt,
      parameters: {
        max_new_tokens: 512,
        temperature: 1,
        top_p: 1,
        top_k: 1,
      },
    },
  ];

  async function predict_model(projectId, location, endpointId, instances) {
    const clientOptions = {
      apiEndpoint: `${location}-aiplatform.googleapis.com`,
      keyFilename: CREDENTIALS_PATH,
    };

    try {
      const predictionServiceClient = new PredictionServiceClient(clientOptions);
      const endpoint = `projects/${projectId}/locations/${location}/endpoints/${endpointId}`;

      const predictionRequest = {
        endpoint,
        instances: instances.map((instance) => helpers.toValue(instance)),
      };

      const [response] = await predictionServiceClient.predict(predictionRequest);
      return response.predictions[0].stringValue;
    } catch (error) {
      console.error("Prediction error:", error);
      throw new ResponseError(500, "Error connecting to AI service");
    }
  }

  let [model, resultJson] = [null, null];

  try {
    const predict = await predict_model(projectId, location, endpointId, instances);
    console.log(predict);
    resultJson = parseJSON(predict);
  } catch (e) {
    throw new ResponseError(e.status || 500, e.message);
  }

  model = validate(vertexAIValidation, resultJson);

  if (!model) {
    throw new ResponseError(500, "Failed to get recommendation, please try again, code 2");
  }

  if (model.data.message.length < 10) {
    throw new ResponseError(500, "Failed to get recommendation, please try again, code 3");
  }

  const recommendation = await prismaClient.modelResult.create({
    data: {
      predict_id: predict.id,
      skin_type: req.skin_type,
      product_category: req.product_category,
      ingredient: model.data.ingredient,
      msg_recommendation: model.data.message,
    },
  });

  const data = {
    result_id: recommendation.id,
    ingredient: model.data.ingredient,
    message: model.data.message,
  };

  return {
    status: true,
    message: "Successfull get recommendation",
    data: data,
  };
};

const getProductRecommendation = async (req) => {
  req = validate(getProductRecommendationValidation, req);

  if (!req) {
    throw new ResponseError(400, "Invalid input");
  }

  const model = await prismaClient.modelResult.findUnique({
    where: {
      id: req.result_id,
    },
  });

  if (!model) {
    throw new ResponseError(404, "Result ID not found");
  }

  const filter = [];

  if (model.product_category) {
    filter.push({
      category: {
        contains: model.product_category,
        mode: "insensitive",
      },
    });
  }

  if (model.ingredient) {
    const descriptions = Array.isArray(model.ingredient) ? model.ingredient : [model.ingredient];
    const descriptionFilters = descriptions.map((description) => ({
      description: {
        search: description
          .split(" ")
          .map((term) => term.trim())
          .filter((term) => term.length > 0)
          .join(" & "),
      },
    }));
    filter.push({
      OR: descriptionFilters,
    });
  }

  const allProducts = await prismaClient.product.findMany({
    where: {
      AND: filter,
    },
  });

  const ingredientMatches = {};

  const productsWithMatchCount = allProducts.map((product) => {
    const productIngredients = product.description
      .toLowerCase()
      .split(",")
      .map((i) => i.trim());

    const matches = model.ingredient.filter((recommended) => productIngredients.some((prodIng) => prodIng.includes(recommended.toLowerCase())));

    matches.forEach((ingredient) => {
      ingredientMatches[ingredient] = (ingredientMatches[ingredient] || 0) + 1;
    });

    return {
      ...product,
      matchCount: matches.length,
      matchedIngredients: matches,
    };
  });

  const allFilteredProducts = productsWithMatchCount.filter((product) => product.matchCount > 0).sort((a, b) => b.matchCount - a.matchCount);

  if (req.product_id) {
    const productById = productsWithMatchCount.filter((product) => product.id === req.product_id && product.matchCount > 0).sort((a, b) => b.matchCount - a.matchCount);

    if (productById.length === 0) {
      throw new ResponseError(404, "Product not found or no ingredient matches");
    }

    return {
      success: true,
      message: "Product successfully retrieved",
      data: productById[0],
    };
  }

  const totalItems = allFilteredProducts.length;
  const skip = (req.page - 1) * req.size;

  const paginatedProducts = allFilteredProducts.slice(skip, skip + req.size);

  if (paginatedProducts.length === 0) {
    throw new ResponseError(404, "No product found or no ingredient matches");
  }

  return {
    success: true,
    message: "Product successfully retrieved",
    data: paginatedProducts,
    meta: {
      page: req.page,
      total_items: totalItems,
      total_page: Math.ceil(totalItems / req.size),
    },
  };
};

const getPredictions = async (userData) => {
  const decodedToken = validate(getUserValidation, userData);

  const userRecord = await admin.auth().getUser(decodedToken.uid);
  const uid = userRecord.uid;

  if (decodedToken.uid !== uid) {
    throw new ResponseError(404, "User not found");
  }

  const predictions = await prismaClient.modelPredict.findMany({
    where: {
      user_id: uid,
    },
    select: {
      id: true,
      acne_type: true,
      image_url: true,
      createdAt: true,
      result: true,
    },
  });

  return {
    success: true,
    message: "Predictions successfully retrieved",
    data: predictions,
  };
};

const getPredictionById = async (id) => {
  const predict = validate(getPredictionByIdValidation, id);

  if (!predict) {
    throw new ResponseError(400, "Invalid input");
  }

  const modelPredict = await prismaClient.modelPredict.findUnique({
    where: {
      id: predict,
    },
    select: {
      id: true,
      acne_type: true,
      image_url: true,
      createdAt: true,
      result: true,
    },
  });

  if (!modelPredict) {
    throw new ResponseError(404, "Predict not found");
  }

  return modelPredict;
};

const deletePrediction = async (id) => {
  const predict = validate(getPredictionByIdValidation, id);

  if (!predict) {
    throw new ResponseError(400, "Invalid input");
  }

  const modelPredict = await prismaClient.modelPredict.findUnique({
    where: {
      id: predict,
    },
    select: {
      image_url: true,
    },
  });

  if (!modelPredict) {
    throw new ResponseError(404, "Predict not found");
  }

  if (modelPredict.image_url !== null) {
    try {
      const objectNameToDelete = modelPredict.image_url.split("/").slice(4).join("/");
      const checkFile = cloudStorage.file(objectNameToDelete);
      const [exists] = await checkFile.exists();
      if (exists) {
        await checkFile.delete();
      }
    } catch (e) {
      throw new ResponseError(500, "Please try again later");
    }
  }

  await prismaClient.modelResult.deleteMany({
    where: {
      predict_id: predict,
    },
  });

  await prismaClient.modelPredict.delete({
    where: {
      id: predict,
    },
  });
};

export default { predictModel, vertexAIRecommendation, getProductRecommendation, getPredictions, getPredictionById, deletePrediction };
