const { User } = require("../models/User");
const bcrypt = require("bcrypt");
const express = require("express");
const jwt = require("jsonwebtoken");

const userRouter = express.Router();
userRouter.post("/signUp", signUp);
userRouter.post("/login", login);

async function signUp(req, res) {
  const email = req.body.email;
  const password = req.body.password;
  if (email == null || password == null) {
    res.status(400).send("Email and password are required");
    return;
  }
  try {
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
    await User.create(user);
  } catch (e) {
    console.error(e);
    res.status(500).send("something went wrong");
    res.send("sign up");
  }
}

async function login(req, res) {
  const body = req.body;
  if (body.email == null || body.password == null) {
    res.status(400).send("Email and password are required");
    return;
  }
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
    token: generateToken(userInDb._id),
  });
}

function generateToken(idInDb) {
  const payload = {
    userId: idInDb,
  };
  const jwtSecret = String(process.env.JWT_SECRET);
  const token = jwt.sign(payload, jwtSecret, {
    expiresIn: "1d",
  });
  return token;
}

function hashPassword(password) {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  return hash;
}

function isPasswordCorrect(password, hash) {
  return bcrypt.compareSync(password, hash);
}

module.exports = { userRouter };
