const { books } = require("../db/books");
const { Book } = require("../models/Book");
const express = require("express");
const { upload } = require("../middleware/multer");

async function postBooks(req, res) {
  const book = req.body;
  console.log("book:", book);
  const result = await Book.create(book);
  console.log("result:", result);
}

function getBooks(req, res) {
  res.send(books);
}

const booksRouter = express.Router();
booksRouter.get("/", getBooks);
booksRouter.post("/", upload.single("image"), postBooks);

module.exports = { booksRouter };
