require("dotenv").config();
const { app } = require("./config/app");

const { userRouter } = require("./controllers/users.controllers");
const { booksRouter } = require("./controllers/books.controller");

const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => res.send("server runing"));

app.use("/api/auth", userRouter);
app.use("/api/books", booksRouter);

app.listen(PORT, function () {
  console.log(`server is running on : ${PORT}`);
});
