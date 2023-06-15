const { app } = require("./config/app");

const { userRouter } = require("./controllers/users.controllers");
const { booksRouter } = require("./controllers/books.controller");

app.get("/", (req, res) => res.send("hello World"));

app.use("/api/auth", userRouter);
app.use("/api/books", booksRouter);
