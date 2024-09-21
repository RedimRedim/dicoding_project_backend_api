const express = require("express");
const { nanoid } = require("nanoid");
const dotenv = require("dotenv");
dotenv.config();
const joi = require("joi");
const port = process.env.PORT;
const app = express();
app.use(express.json()); // Middleware to parse JSON bodies
// In-memory array to store books
const jsonString = `
       [ {
            "bookId": "u6Vs65MR2g1HYpEXKyRMD",
            "title": "test",
            "name": "test",
            "year": 1993,
            "author": "test",
            "summary": "test",
            "publisher": "test",
            "pageCount": 25,
            "readPage": 23,
            "reading": false,
            "finished": false,
            "insertedAt": "2024-09-21T11:03:37.095Z",
            "updatedAt": "2024-09-21T11:03:37.095Z"
        },
        {
            "bookId": "eSS_tYQ-_qQd-xirJLgtv",
            "title": "test",
            "name": "test",
            "year": 1993,
            "author": "test",
            "summary": "test",
            "publisher": "test",
            "pageCount": 25,
            "readPage": 23,
            "reading": false,
            "finished": false,
            "insertedAt": "2024-09-21T11:03:59.239Z",
            "updatedAt": "2024-09-21T11:03:59.239Z"
        },
        {
            "bookId": "PbZ0n32S7rCYA_b46Avqc",
            "title": "test",
            "name": "test",
            "year": 1993,
            "author": "test",
            "summary": "test",
            "publisher": "test",
            "pageCount": 25,
            "readPage": 23,
            "reading": false,
            "finished": false,
            "insertedAt": "2024-09-21T11:04:00.253Z",
            "updatedAt": "2024-09-21T11:04:00.253Z"
}]
`;

let books = JSON.parse(jsonString);

const bookSchema = joi.object({
  name: joi.string().required(),
  year: joi.number().required(),
  author: joi.string().required(),
  summary: joi.string().required(),
  publisher: joi.string().required(),
  pageCount: joi.number().required(),
  readPage: joi.number().required(),
  reading: joi.boolean().default(false),
});

app.post("/books", (req, res) => {
  const { error, value } = bookSchema.validate(req.body);

  errorCountMessage =
    value.readPage > value.pageCount
      ? "readPage cannot greater than pageCount"
      : "";

  if (error || errorCountMessage)
    return res.status(400).send({
      status: "failed",
      message: `Error adding book. ${
        error ? error.message : errorCountMessage
      }`,
    });

  const insertedAt = new Date().toISOString();
  const pageCount = value.pageCount ? Number(value.pageCount) : undefined;
  const readPage = value.readPage ? Number(value.readPage) : undefined;

  const responseData = {
    bookId: nanoid(),
    ...value,
    finished: pageCount === readPage,
    insertedAt: insertedAt,
    updatedAt: insertedAt,
  };
  books.push(responseData);
  res.status(201).send({
    status: "success",
    message: "Book has been succesfully added",
    data: { bookId: responseData.bookId },
  });
});

app.get("/books", (req, res) => {
  if (books) {
    res.status(200).send({ status: "success", data: { books } });
  }
});

app.get("/books/:bookId", (req, res) => {
  const { bookId } = req.params;
  console.log(bookId);

  const book = books.find((book) => book.bookId == bookId);

  if (!book) {
    return res.status(404).send({ status: "fail", message: "Book  not found" });
  }

  res.status(200).send({ status: "success", data: { book } });
});

app.put("/books/:bookId", (req, res) => {
  const { bookId } = req.params;
  const { error, value } = bookSchema.validate(req.body);
  //TODO HANDLING ERROR SITE => pageCount > readPage | Variable Type Handling | ID not found
  const book = books.find((book) => book.bookId === bookId);
  bookNotFoundMessage = !book ? "BookId not found" : "";
  if (bookNotFoundMessage) {
    return res.status(404).send({
      status: "failed",
      message: `Error adding book. ${bookNotFoundMessage}`,
    });
  } else {
    //book is found
    Object.assign(book, value, { updatedAt: new Date().toISOString() });
  }

  errorCountMessage =
    value.readPage > value.pageCount
      ? "readPage cannot greater than pageCount"
      : "";
  if (error || errorCountMessage)
    return res.status(400).send({
      status: "failed",
      message: `Error adding book. ${
        error ? error.message : errorCountMessage
      }`,
    });

  res.status(200).send({
    status: "success",
    message: "Book has been updated",
    data: { bookId },
  });
});

app.delete("/books/:bookId", (req, res) => {
  const { bookId } = req.params;
  const book = books.find((book) => book.bookId == bookId);

  if (!book) {
    return res
      .status(404)
      .send({ status: "failed", message: "Book Id not found" });
  }

  for (const book in books) {
    if (books[book].bookId === bookId) {
      books.splice(book, 1);
      break;
    }
  }

  res.status(200).send({ status: "success", message: "Book has been deleted" });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
