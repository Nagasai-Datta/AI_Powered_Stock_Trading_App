const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  cash: { type: Number, default: 100000 }, // starting buying power (₹)
  isDemo: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const UserModel = mongoose.model("User", userSchema);
module.exports = { UserModel };
