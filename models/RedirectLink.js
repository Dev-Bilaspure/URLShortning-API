const mongoose = require("mongoose");

const RedirectLinkSchema = new mongoose.Schema({
    sourceId: {
      type: String,
      required: true,
      unique: true
    },
    destinationURL: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("RedirectLink", RedirectLinkSchema);