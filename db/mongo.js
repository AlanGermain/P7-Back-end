require("dotenv").config();
const mongoose = require("mongoose");

const DB_URL = `mongodb+srv://${USER}:${PASSWORD}@${DB_DOMAIN}`;
console.log("DB_URL:", DB_URL);
async function connect() {
  try {
    await mongoose.connect(DB_URL);
    console.log("conect to DB");
  } catch (e) {
    console.error(e);
  }
}
connect();
const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User = mongoose.model("User", UserSchema);

module.exports = { User };
