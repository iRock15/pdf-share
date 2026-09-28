const CreateError = require("../utils/createError");
const User = require("../models/userModel");

exports.getAllUsers = async (req, res, next) => {
  // restirected route to role = "admin"
  try {
    const allUsers = await User.find().select("-_id -__v");
    res.status(200).json({
      status: "success",
      length: allUsers.length,
      allUsers,
    });
  } catch (error) {
    next(error);
  }
};

exports.makeAdmin = async (req, res, next) => {
  // restricted
  try {
    const userID = req.body?.id;
    const email = req.body?.email;
    if (!userID && !email)
      throw new CreateError("Please provide user ID. or email", 400);

    let user;
    if (userID) {
      user = await User.findById(userID);
      if (!user) throw new CreateError("Invalid user ID.", 400);
    } else if (email) {
      user = await User.findOne({ email });
      if (!user) throw new CreateError("Invalid email.", 400);
    }

    if (user.role === "admin")
      throw new CreateError("User is already an admin.", 400);
    if (!user.isVerified)
      throw new CreateError(
        "User is not verified. Please make sure the user is verified",
        400,
      );

    user.role = "admin";
    await user.save();
    res.status(200).json({
      status: "success",
      message: "User successfully is an admin.",
      user,
    });
  } catch (error) {
    next(error);
  }
};
