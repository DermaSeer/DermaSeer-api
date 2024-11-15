import { admin } from "../application/firebaseAdmin.js";

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      error: "Unauthorized",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    let checkRevoked = true;
    const decodedToken = await admin.auth().verifyIdToken(token, checkRevoked);
    req.user = decodedToken;
    next();
  } catch (e) {
    if (e.code === "auth/id-token-revoked") {
      res.status(401).json({
        error: "Unauthorized, Please login again",
      });
      return;
    }

    res.status(401).json({
      error: "Unauthorized",
    });
  }
};
