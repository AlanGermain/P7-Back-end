const { User } = require("../models/User");
const bcrypt = require("bcrypt");
const express = require("express");

async function signUp(req, res) {
  const email = req.body.email;
  const password = req.body.password;

  const userInDb = await User.findOne({
    email: email,
  });
  console.log("userInDb:", userInDb);
  if (userInDb != null) {
    res.status(400).send("Email Already exists");
    return;
  }
  const user = {
    email: email,
    password: hashPassword(password),
  };
  try {
    await User.create(user);
  } catch (e) {
    console.error(e);
    res.status(500).send("something went wrong");
    return;
  }
  res.send("sign up");
}

async function login(req, res) {
  const body = req.body;

  const userInDb = await User.findOne({
    email: body.email,
  });
  if (userInDb == null) {
    res.status(401).send("wrong credentials");
    return;
  }
  const passwordInDb = userInDb.password;
  if (!isPasswordCorrect(req.body.password, passwordInDb)) {
    res.status(401).send("wrong credentials");
    return;
  }

  res.send({
    userId: userInDb._id,
    token: "token",
  });
}
function hashPassword(password) {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  return hash;
}

function isPasswordCorrect(password, hash) {
  return bcrypt.compareSync(password, hash);
}

const userRouter = express.Router();

userRouter.post("/", signUp);
userRouter.post("/", login);

module.exports = { userRouter };
