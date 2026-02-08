
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../models/index.js";
import config from "../config/auth.config.js";

const User = db.User;
const Role = db.Role;

export const signup = async (req, res) => {
  try {
    const { username, email, password, roles } = req.body;

    const hashedPassword = bcrypt.hashSync(password, 8);

    const user = new User({
      username,
      email,
      password: hashedPassword,
    });


    if (roles && roles.length > 0) {
      const foundRoles = await Role.find({ name: { $in: roles } });
      user.roles = foundRoles.map((r) => r._id);
    } else {
      const role = await Role.findOne({ name: "user" });
      if (role) user.roles = [role._id];
    }

    await user.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Signup failed." });
  }
};

export const signin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username }).populate("roles", "-__v");
    if (!user) return res.status(404).json({ message: "User Not found." });

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
      return res.status(401).json({ accessToken: null, message: "Invalid Password!" });
    }

    const token = jwt.sign({ id: user.id }, config.secret, { expiresIn: 86400 }); 

    const authorities = (user.roles || []).map((r) => `ROLE_${String(r.name).toUpperCase()}`);

    res.status(200).json({
      id: user._id,
      username: user.username,
      email: user.email,
      roles: authorities,
      accessToken: token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Signin failed." });
  }
};

export const me = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password").populate("roles", "-__v");
    if (!user) return res.status(404).json({ message: "User not found!" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch user." });
  }
};
