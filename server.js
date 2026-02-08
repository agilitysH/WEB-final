// server.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import db from "./models/index.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import apiRoutes from "./routes/api.routes.js";
import watchlistRoutes from "./routes/watchlist.routes.js";
import reviewRoutes from "./routes/reviews.routes.js";
import animeRoutes from "./routes/anime.routes.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
 
// Middleware configuration
const corsOptions = {
    origin: "http://localhost:5500",
};
 
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/app", express.static(path.join(__dirname, "public")));
 
// Simple route for testing
app.get("/", (req, res) => {
    res.json({ message: "Welcome to the Node.js JWT Authentication application." });
});
 
// Routes
app.use("/api", apiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/test", userRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/anime", animeRoutes);
 
// Set port, MongoURI and start server
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error("MONGO_URI is not set. Add it to .env or the environment.");
    process.exit(1);
}
 
// Connect to MongoDB and start the server
db.mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log("Successfully connected to MongoDB.");
        // Initialize roles in the database
        initial();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}.`);
        });
    })
    .catch((err) => {
        console.error("Connection error:", err);
        process.exit();
    });
 
// Initial function to populate roles
function initial() {
    db.Role.estimatedDocumentCount()
        .then((count) => {
            if (count === 0) {
                return Promise.all([
                    new db.Role({ name: "user" }).save(),
                    new db.Role({ name: "admin" }).save(),
                    new db.Role({ name: "moderator" }).save(),
                ]);
            }
        })
        .then((roles) => {
            if (roles) {
                console.log(
                    "Added 'user', 'admin', and 'moderator' to roles collection.",
                );
            }
        })
        .catch((err) => {
            console.error("Error initializing roles:", err);
        });
}
