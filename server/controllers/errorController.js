const CreateError = require("../utils/createError");

const handleValidationErrorDB = (err) => {
  const errorsObj = {};
  const formattedErrors = Object.values(err.errors).map((properties) => {
    return {
      field: properties.path,
      message: properties.message,
    };
    // errorsObj[properties.path] = properties.message;
  });
  const message = "Invalid input data.";
  return new CreateError(message, 400, formattedErrors);
};

const handleDuplicateErrorDB = (err) => {
  const fields = Object.keys(err.keyValue);

  const message = `Duplicate value for field(s): ${fields.join(", ")}. Please use another value.`;
  return new CreateError(message, 400);
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;

  return new CreateError(message, 400);
};

const handleJWTError = () => {
  const message = `Invalid token. Please log in again.`;
  return new CreateError(message, 401);
};

const handleExpiredToken = () => {
  const message = `Your token has expired. Please log in again.`;
  return new CreateError(message, 401);
};

const sendErrorProd = (error, res) => {
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      ...(error.errors && { errors: error.errors }),
    });
  } else {
    console.error(`An error occured`, error);
    res.status(error.statusCode).json({
      status: "fail",
      message: "Something went wrong. Please try again later",
    });
  }
};

const sendErrorDev = (error, res) => {
  //   console.log(error);
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    ...(error.errors && { errors: error.errors }),
    stack: error.stack,
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "Error";

  let error = { ...err };
  error.message = err.message;
  error.name = err.name;
  error.stack = err.stack;

  if (err.name === "ValidationError") {
    error = handleValidationErrorDB(error);
  }
  if (err.code === 11000) {
    error = handleDuplicateErrorDB(error);
  }
  if (err.name === "CastError") {
    error = handleCastErrorDB(error);
  }
  if (err.name === "JsonWebTokenError") {
    error = handleJWTError(error);
  }
  if (err.name === "TokenExpiredError") {
    error = handleExpiredToken(error);
  }
  if (process.env.NODE_ENV === "development") {
    console.log(error);
    sendErrorDev(error, res);
  } else if (process.env.NODE_ENV === "production") {
    sendErrorProd(error, res);
  }
};
