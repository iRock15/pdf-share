const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

const userRouter = require("./routes/userRoutes");
const globalErrorHandler = require("./controllers/errorController");

app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(express.json());

const logger = (req, res, next) => {
  if (req) {
    console.log(
      "⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️  REGUEST!  ⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️",
    );
    next();
  }
};

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  app.use(logger);
}

app.use(cookieParser());
app.use("/api/v1/users", userRouter);

// app.use("/", (req, res, next) => {
//   console.log(req);
//   res.status(200).json({
//     message: "success",
//   });
// });
app.use(globalErrorHandler);

module.exports = app;
