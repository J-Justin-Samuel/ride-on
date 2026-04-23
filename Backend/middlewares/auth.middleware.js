import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import blacklistTokenModel from "../models/blacklistToken.model.js";
import captainModel from "../models/captain.model.js";

const authUser = async (req, res, next) => {
  // Read from userToken cookie OR Authorization header
  const token =
    req.cookies.userToken || req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const isBlacklisted = await blacklistTokenModel.findOne({ token });
  if (isBlacklisted) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded._id || decoded.id); // ← fix
    if (!user) return res.status(401).json({ message: "User not found" });
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const authCaptain = async (req, res, next) => {
  // Read from captainToken cookie OR Authorization header
  const token =
    req.cookies.captainToken || req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const isBlacklisted = await blacklistTokenModel.findOne({ token });
  if (isBlacklisted) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const captain = await captainModel.findById(decoded._id || decoded.id); // ← fix
    if (!captain) return res.status(401).json({ message: "Captain not found" });
    req.captain = captain;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default { authUser, authCaptain };
