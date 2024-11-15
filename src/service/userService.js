import { prismaClient } from "../application/database.js";
import { ResponseError } from "../error/responseError.js";
import { validate } from "../validation/validation.js";
import { admin } from "../application/firebaseAdmin.js";
import { authFirebase } from "../application/firebaseAuth.js";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { inputUserValidation, getUserValidation, updateUserValidation, updateUserDataValidation } from "../validation/userValidation.js";
import { cloudStorage } from "../application/cloudStorage.js";
import { nanoid } from "nanoid";
import { extname } from "path";

const register = async (req) => {
  const user = validate(inputUserValidation, req);

  if (!user) {
    throw new ResponseError(400, "invalid input");
  }

  let userRecord = null;
  try {
    userRecord = await createUserWithEmailAndPassword(authFirebase, user.email, user.password);
  } catch (e) {
    throw new ResponseError(400, e.message);
  }

  const checkUser = await prismaClient.user.count({
    where: {
      email: user.email,
    },
  });

  if (checkUser === 1) {
    throw new ResponseError(400, "user already exists");
  }

  await prismaClient.user.create({
    data: {
      uid: userRecord.user.uid,
      email: user.email,
    },
  });

  return userRecord;
};

const login = async (req) => {
  const user = validate(inputUserValidation, req);

  if (!user) {
    throw new ResponseError(400, "invalid input");
  }

  try {
    const userRecord = await signInWithEmailAndPassword(authFirebase, user.email, user.password);

    return userRecord;
  } catch (e) {
    throw new ResponseError(400, "invalid email or password");
  }
};

const get = async (req) => {
  const userId = validate(getUserValidation, req);

  const user = await prismaClient.user.findUnique({
    where: {
      uid: userId.uid,
    },
    select: {
      email: true,
      first_name: true,
      last_name: true,
      birthday: true,
      gender: true,
      profile_picture: true,
    },
  });

  if (!user) {
    throw new ResponseError(404, "user not found");
  }

  return user;
};

const updateUser = async (userData, request) => {
  const decodedToken = validate(getUserValidation, userData);
  const user = validate(updateUserValidation, request);

  if (!decodedToken) {
    throw new ResponseError(400, "invalid input");
  }

  if (!decodedToken.firebase.sign_in_provider === "password") {
    throw new ResponseError(400, "user not registered with email and password");
  }

  try {
    const userRecord = await admin.auth().getUser(decodedToken.uid);
    const uid = userRecord.uid;
    if (decodedToken.uid !== uid) {
      throw new ResponseError(404, "user not found");
    }

    const checkUser = await prismaClient.user.count({
      where: {
        uid: decodedToken.uid,
      },
    });

    if (checkUser === 0) {
      throw new ResponseError(404, "user not found");
    }
  } catch (e) {
    throw new ResponseError(400, e.message);
  }

  let userUpdate = null;
  try {
    await admin.auth().updateUser(decodedToken.uid, {
      email: user.email,
      password: user.password,
    });

    const data = {};

    if (user.email) {
      data.email = user.email;
    }

    userUpdate = await prismaClient.user.update({
      where: {
        uid: decodedToken.uid,
      },
      data: data,
      select: {
        email: true,
        first_name: true,
        last_name: true,
        birthday: true,
        gender: true,
        profile_picture: true,
      },
    });
  } catch (e) {
    throw new ResponseError(400, e.message);
  }

  return userUpdate;
};

const updateUserData = async (userData, request, file) => {
  const decodedToken = validate(getUserValidation, userData);
  const user = validate(updateUserDataValidation, { ...request, profile_picture: file });

  if (!decodedToken) {
    throw new ResponseError(400, "invalid input");
  }

  try {
    const userRecord = await admin.auth().getUser(decodedToken.uid);
    const uid = userRecord.uid;
    if (decodedToken.uid !== uid) {
      throw new ResponseError(404, "user not found");
    }

    const checkUser = await prismaClient.user.count({
      where: {
        uid: decodedToken.uid,
      },
    });

    if (checkUser === 0) {
      await prismaClient.user.create({
        data: {
          uid: decodedToken.uid,
          email: decodedToken.email,
        },
      });
    }
  } catch (e) {
    throw new ResponseError(400, e.message);
  }

  const data = {};

  if (user.first_name) {
    data.first_name = user.first_name;
  }

  if (user.last_name) {
    data.last_name = user.last_name;
  }

  if (user.birthday) {
    data.birthday = user.birthday;
  }

  if (user.gender) {
    data.gender = user.gender;
  }

  if (file) {
    try {
      const checkProfilePicture = await prismaClient.user.findUnique({
        where: {
          uid: decodedToken.uid,
        },
        select: {
          profile_picture: true,
        },
      });

      if (checkProfilePicture.profile_picture !== null) {
        const objectNameToDelete = checkProfilePicture.profile_picture.split("/").slice(4).join("/");
        console.log(`File ${objectNameToDelete} deleted.`);
        const checkFile = cloudStorage.file(objectNameToDelete);
        const [exists] = await checkFile.exists();
        if (exists) {
          await checkFile.delete();
        }
      }

      const fileName = `${nanoid()}${extname(file.originalname)}`;
      const destination = `users/${fileName}`;
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
          const [makeFilePublic] = await cloudFile.makePublic();
          console.log(`File uploaded to ${destination} and is now public.`);
          data.profile_picture = `https://storage.googleapis.com/${makeFilePublic.bucket}/${makeFilePublic.object}`;
          resolve();
        });

        stream.end(file.buffer);
      });
    } catch (e) {
      throw new ResponseError(400, e.message);
    }
  }

  const userUpdate = await prismaClient.user.update({
    where: {
      uid: decodedToken.uid,
    },
    data: data,
    select: {
      email: true,
      first_name: true,
      last_name: true,
      birthday: true,
      gender: true,
      profile_picture: true,
    },
  });

  return userUpdate;
};

const logout = async (req) => {
  const decodedToken = validate(getUserValidation, req);

  if (!decodedToken) {
    throw new ResponseError(400, "invalid input");
  }

  try {
    const uid = decodedToken.uid;

    await admin.auth().revokeRefreshTokens(uid);
    const user = await admin.auth().getUser(uid);

    return user;
  } catch (e) {
    throw new ResponseError(400, e.message);
  }
};

export default { register, login, get, updateUser, updateUserData, logout };