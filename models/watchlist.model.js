import mongoose from "mongoose";

const watchlistSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        animeId: {
            type: Number,
            required: true,
            unique: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ["Watching", "Plan to Watch", "Completed", "Dropped"],
            required: true,
        },
        episodesWatched: {
            type: Number,
            default: 0,
        },
        score: {
            type: Number,
            min: 1,
            max: 10,
        },
    },
    { timestamps: true },
);

const Watchlist = mongoose.model("Watchlist", watchlistSchema);
export default Watchlist;
