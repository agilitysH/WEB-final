import mongoose from "mongoose";
import dbConfig from "../config/db.config.js";
 
import User from "./user.model.js";
import Role from "./role.model.js";
import Watchlist from "./watchlist.model.js";
import Review from "./review.model.js";
 
const db = {};
 
db.mongoose = mongoose;
db.User = User;
db.Role = Role;
db.Watchlist = Watchlist;
db.Review = Review;
 
db.ROLES = ["user", "admin", "moderator"];
db.config = dbConfig;
 
export default db;
