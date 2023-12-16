const mongoose = require("mongoose");
const schema = mongoose.Schema;
const { v4: uuidv4 } = require("uuid");

// home Schema
const homeSchema = new schema(
  {
    home_uuid: {
      type: String,
      required: true,
      unique: true,
      default: uuidv4,
    },
    targetGender: {
      type: String,
      required: true,
      enum: ["men", "women", "both", "kids", "all"],
    },
    selectedServices: {
      type: [String],
      required: true,
    },
    appointmentDate: {
      type: String,
      required: true,
    },
    appointmentTime: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: String,
      required: true,
    },
    fullAddress: {
      type: String,
      required: true,
    },
    suggestions: {
      type: String,
    },
  },
  { timestamps: true }
);

// End of the modal

module.exports = mongoose.model("home", homeSchema, "homes");
//developed by Nitin Goswami
