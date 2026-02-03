const mongoose = require("mongoose");

const mangaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    author: {
      type: String,
      required: true
    },

    description: {
      type: String,
      required: true
    },

    genres: {
      type: [String],
      required: true
    },

    status: {
      type: String,
      enum: ["ongoing", "completed", "hiatus"],
      default: "ongoing"
    },

    releaseYear: {
      type: Number
    },

    coverImage: { // if present
      type: String 
    },

    averageRating: {
      type: Number,
      default: 0
    },
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Manga", mangaSchema);
