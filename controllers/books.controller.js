const { upload, resizeImage } = require("../middleware/multer");
const { Book } = require("../models/Book");
const express = require("express");
const jwt = require("jsonwebtoken");
const path = require("path");

const booksRouter = express.Router();

booksRouter.get("/bestrating", getBestRating);
booksRouter.get("/:id", getBookId);
booksRouter.get("/", getBooks);
booksRouter.post(
  "/",
  checkToken,
  upload.single("image"),
  resizeImage,
  postBooks
);
booksRouter.delete("/:id", checkToken, deleteBook);
booksRouter.put(
  "/:id",
  checkToken,
  upload.single("image"),
  resizeImage,
  putBook
);
booksRouter.post("/:id/rating", checkToken, postRating);

async function getBestRating(req, res) {
  try {
    const bookWithBestRatings = await Book.find().sort({ rating: -1 }).limit(3);
    bookWithBestRatings.forEach((book) => {
      book.imageUrl = getAbsoluteImagePath(book.imageUrl);
    });
    console.log("bestrating:", bookWithBestRatings);
    res.send(bookWithBestRatings);
  } catch (e) {
    console.error(e);
    res.status(500).send("Something went wrong: " + e.message);
  }
}
async function postRating(req, res) {
  const id = req.params.id;
  if (id == null || id == "undefined") {
    res.status(400).send("Book id is missing");
    return;
  }
  const rating = req.body.rating;
  const userId = req.tokenPayload.userId;
  try {
    const book = await Book.findById(id);
    if (book == null) {
      res.status(404).send("Book not found");
      return;
    }
    const ratingsInDb = book.ratings;
    const previousRatingFromCurrentUser = ratingsInDb.find(
      (rating) => TimeRanges.userId == userId
    );
    if (previousRatingFromCurrentUser != null) {
      res.status(404).send("you have already rated this book");
      return;
    }
    const newRating = { userId: userId, grade: rating };
    ratingsInDb.push(newRating);
    book.averageRating = calculateAverageRating(ratingsInDb);
    await book.save();
    res.send("rating posted");
  } catch (e) {
    console.error(e);
    res.status(500).send("Something went wrong: " + e.message);
  }
}
function calculateAverageRating(ratings) {
  const sumOfAllGrade = ratings.reduce((sum, rating) => sum + rating.grade, 0);
  return sumOfAllGrade / ratings.length;
}

function checkToken(req, res, next) {
  const headers = req.headers;
  const authorization = headers.authorization;
  if (authorization == null) {
    res.status(401).send("unauthorized");
    return;
  }
  const token = authorization.split(" ")[1];
  try {
    const jwtSecret = String(process.env.JWT_SECRET);
    const tokenPayload = jwt.verify(token, jwtSecret);
    if (tokenPayload == null) {
      res.status(401).send("unauthorized");
      return;
    }
    req.tokenPayload = tokenPayload;
    next();
  } catch (e) {
    console.error(e);
    res.status(401).send("unauthorized");
  }
}

async function putBook(req, res) {
  const id = req.params.id;

  const book = req.body;
  if (book == null) {
    res.status(404).send("Book not found");
    return;
  }
  const bookInDb = await Book.findById(id);
  if (!bookInDb) {
    res.status(404).send("Book not found");
    return;
  }
  const userInDb = bookInDb.userId;
  const userIdInToken = req.tokenPayload.userId;
  if (userInDb != userIdInToken) {
    res.status(403).send("you can't delete other people's books");
    return;
  }
  const newBook = {};
  if (book.title) newBook.title = book.title;
  if (book.author) newBook.author = book.author;
  if (book.year) newBook.year = book.year;
  if (book.genre) newBook.genre = book.genre;
  if (req.file != null) newBook.imageUrl = req.file.filename;

  await Book.findByIdAndUpdate(id, newBook);
  res.send(" Book updated");
}

async function deleteBook(req, res) {
  const id = req.params.id;
  try {
    const bookInDb = await Book.findById(id);
    if (bookInDb == null) {
      res.status(404).send("Book not found");
      return;
    }
    const userInDb = bookInDb.userId;
    const userIdInToken = req.tokenPayload.userId;
    if (userInDb != userIdInToken) {
      res.status(403).send("you can't delete other people's books");
      return;
    }
    await Book.findByIdAndDelete(id);
    res.send("Book Delete");
  } catch (e) {
    console.error(e);
    res.status(500).send("Something went wrong: " + e.message);
  }
}

async function getBookId(req, res) {
  const id = req.params.id;
  console.log("hello");
  try {
    const book = await Book.findById(id);
    if (book == null) {
      res.status(404).send("Book not found");
      return;
    }
    book.imageUrl = getAbsoluteImagePath(book.imageUrl);
    res.send(book);
  } catch (e) {
    console.error(e);
    res.status(500).send("Something went wrong: " + e.message);
  }
}

async function postBooks(req, res) {
  const file = req.file;
  console.log("file:", file);
  const stringifiedBook = req.body.book;
  const book = JSON.parse(stringifiedBook);
  const filename = file.filename;
  book.imageUrl = filename;
  // Ajouter une validation pour l'année (year)
  if (isNaN(book.year)) {
    return res.status(400).send("Invalid year. Year must be a number.");
  }

  try {
    const result = await Book.create(book);
    res.send({ message: "Book posted", book: result });
  } catch (e) {
    console.error(e);
    res.status(500).send("Something went wrong: " + e.message);
  }
}

async function getBooks(req, res) {
  const books = await Book.find();
  books.forEach((book) => {
    book.imageUrl = getAbsoluteImagePath(book.imageUrl);
  });
  res.send(books);
}
{
  /*sert a avoir le chemin de l'image */
}
function getAbsoluteImagePath(imageUrl) {
  const webpPath = imageUrl.replace(/\.[^/.]+$/, ".webp");

  return (
    process.env.PUBLIC_URL + "/" + process.env.IMAGES_FOLDER + "/" + webpPath
  );
}

module.exports = { booksRouter };
