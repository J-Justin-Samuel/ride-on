import captainModel from "../models/captain.model.js";
import captainService from "../services/captain.service.js";
import blacklistTokenModel from "../models/blacklistToken.model.js";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";

const registerCaptain = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullname, email, password, vehicle } = req.body;

  const isCaptainAlreadyExist = await captainModel.findOne({ email });
  if (isCaptainAlreadyExist) {
    return res.status(400).json({ message: "Captain already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const captain = await captainService.createCaptain({
    firstname: fullname.firstname,
    lastname: fullname.lastname,
    email,
    password: hashedPassword,
    color: vehicle.color,
    plate: vehicle.plate,
    capacity: vehicle.capacity,
    vehicleType: vehicle.vehicleType,
  });

  const token = captain.generateAuthToken();

  //captainToken cookie
  res.cookie("captainToken", token);

  res.status(201).json({ captain, token });
};

const loginCaptain = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  const captain = await captainModel.findOne({ email }).select("+password");
  if (!captain) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const isMatch = await captain.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = captain.generateAuthToken();

  res.cookie("captainToken", token);

  res.status(200).json({ token, captain });
};

const getCaptainProfile = async (req, res, next) => {
  // req.captain is set by authCaptain middleware
  res.status(200).json({ captain: req.captain });
};

const logoutCaptain = async (req, res, next) => {
  // read from captainToken cookie or header
  const token =
    req.cookies.captainToken || req.headers.authorization?.split(" ")[1];

  if (token) {
    await blacklistTokenModel.create({ token });
  }

  res.clearCookie("captainToken");
  res.status(200).json({ message: "Logout successful" });
};

export default {
  registerCaptain,
  loginCaptain,
  getCaptainProfile,
  logoutCaptain,
};
