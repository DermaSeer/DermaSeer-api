import userService from "../service/userService.js";

const register = async (req, res, next) => {
  try {
    const user = await userService.register(req.body);
    res.status(201).json({
      success: true,
      message: "Register successful",
      data: {
        email: user.user.email,
      },
    });
  } catch (e) {
    next(e);
  }
};

const login = async (req, res, next) => {
  try {
    const user = await userService.login(req.body);
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        email: user.user.email,
        emailVerified: user.user.emailVerified,
        token: user.user.stsTokenManager,
      },
    });
  } catch (e) {
    next(e);
  }
};

const get = async (req, res, next) => {
  try {
    const userData = req.user;
    const user = await userService.get(userData);
    res.status(200).json({
      success: true,
      message: "Get user successful",
      data: {
        user,
      },
    });
  } catch (e) {
    next(e);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const userData = req.user;
    const request = req.body;
    const user = await userService.updateUser(userData, request);
    res.status(200).json({
      success: true,
      message: "Update user successful",
      data: {
        user,
      },
    });
  } catch (e) {
    next(e);
  }
};

const updateUserData = async (req, res, next) => {
  try {
    const userData = req.user;
    const request = req.body;
    const file = req.file;

    const user = await userService.updateUserData(userData, request, file);
    res.status(200).json({
      success: true,
      message: "Update user data successful",
      data: {
        user,
      },
    });
  } catch (e) {
    next(e);
  }
};

const logout = async (req, res, next) => {
  try {
    const userData = req.user;
    const user = await userService.logout(userData);
    res.status(200).json({
      success: true,
      message: "Logout successful",
      data: {
        email: user.email,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (e) {
    next(e);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const userData = req.user;
    await userService.deleteUser(userData);
    res.status(200).json({
      success: true,
      message: "Delete user successful",
    });
  } catch (e) {
    next(e);
  }
};

export default { register, login, get, updateUser, updateUserData, logout, deleteUser };
