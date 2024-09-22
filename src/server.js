const bookSchema = require("./server-schema");
const Hapi = require("@hapi/hapi");
const { nanoid } = require("nanoid");
const dotenv = require("dotenv");
dotenv.config();

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT,
    host: "localhost",
  });

  let books = [];

  server.route({
    method: "GET",
    path: "/books",
    handler: (req, h) => {
      if (books && books.length > 0) {
        const { name, reading, finished } = req.query;

        //TODO filter check name, reading or finished otherwise aint need filter
        const finalBookQuery = books
          .filter((book) => {
            const matchesName = name
              ? book.name.toLowerCase().includes(name.toLowerCase())
              : true;

            const matchesReading = reading ? book.reading == reading : true;
            const matchesFinished = finished ? book.finished == finished : true;

            return matchesName && matchesReading && matchesFinished;
          })
          .map((book) => ({
            id: book.bookId,
            name: book.name,
            publisher: book.publisher,
          }));

        return h
          .response({
            status: "success",
            data: { books: finalBookQuery },
          })
          .code(200);
      }
      //TODO RETURNING NOTHING
      return h.response({ status: "success", data: { books: [] } }).code(200);
    },
  });

  server.route({
    method: "POST",
    path: "/books",
    handler: (req, h) => {
      const { error, value } = bookSchema.validate(req.payload);
      const insertedAt = new Date().toISOString();
      const errorCountMessage = value.readPage > value.pageCount;

      if (error) {
        return h
          .response({
            status: "fail",
            message: "Gagal menambahkan buku. Mohon isi nama buku",
          })
          .code(400);
      } else if (errorCountMessage) {
        return h
          .response({
            status: "fail",
            message:
              "Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount",
          })
          .code(400);
      }

      const responseData = {
        bookId: nanoid(),
        ...value,
        finished: value.pageCount === value.readPage,
        insertedAt: insertedAt,
        updatedAt: insertedAt,
      };

      books.push(responseData);

      return h
        .response({
          status: "success",
          message: "Buku berhasil ditambahkan",
          data: {
            bookId: responseData.bookId,
          },
        })
        .code(201);
    },
  });

  server.route({
    method: "GET",
    path: "/books/{bookId}",
    handler: (req, h) => {
      const { bookId } = req.params;
      const book = books.find((b) => b.bookId === bookId);

      if (!book) {
        return h
          .response({ status: "fail", message: "Buku tidak ditemukan" })
          .code(404);
      }
      const { bookId: id, ...rest } = book;
      return h
        .response({ status: "success", data: { book: { id, ...rest } } })
        .code(200);
    },
  });

  server.route({
    method: "PUT",
    path: "/books/{bookId}",
    handler: (req, h) => {
      const { bookId } = req.params;
      const bookIndex = books.findIndex((b) => b.bookId === bookId);
      const { error, value } = bookSchema.validate(req.payload);
      //update book
      const { pageCount, readPage } = req.payload;
      const errorPageMessage = readPage > pageCount;
      if (bookIndex === -1) {
        return h
          .response({
            status: "fail",
            message: "Gagal memperbarui buku. Id tidak ditemukan",
          })
          .code(404);
      }
      if (error) {
        //ERROR IN SCHEMA VALIDATION
        return h
          .response({
            status: "fail",
            message: "Gagal memperbarui buku. Mohon isi nama buku",
          })
          .code(400);
      }
      if (errorPageMessage) {
        return h
          .response({
            status: "fail",
            message:
              "Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount",
          })
          .code(400);
      }

      const updatedBook = {
        ...books[bookIndex],
        ...value,
        updatedAt: new Date().toISOString(),
      };

      books[bookIndex] = updatedBook;

      return h
        .response({
          status: "success",
          message: "Buku berhasil diperbarui",
        })
        .code(200);
    },
  });

  server.route({
    method: "DELETE",
    path: "/books/{bookId}",
    handler: (req, h) => {
      const { bookId } = req.params;

      const bookIndex = books.findIndex((b) => b.bookId === bookId);
      if (bookIndex === -1) {
        return h
          .response({
            status: "fail",
            message: "Buku gagal dihapus. Id tidak ditemukan",
          })
          .code(404);
      }

      books.splice(bookIndex, 1);
      return h
        .response({ status: "success", message: "Buku berhasil dihapus" })
        .code(200);
    },
  });

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

init();
