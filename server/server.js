const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });
const app = require("./app");

// const DB = process.env.DATABASE.replace(
//   "<PASSWORD>",
//   process.env.DATABASE_PASSWORD,
// );

const DB = process.env.DATABASE;
mongoose.connect(DB, { bufferTimeoutMS: 20000 }).then(() => {
  console.log("Connected to DB");
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server Listening on Port ${port}`);
});
