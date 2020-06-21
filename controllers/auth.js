const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const expressJWT = require("express-jwt");

const User = require("../models/user");

// Signup
exports.signup = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
    });
  }

  const user = new User(req.body);

  user.save((err, user) => {
    if (err) {
      return res.status(400).json({
        err: "Not able to save user in DB",
      });
    }
    res.json({
      name: user.name,
      lastname: user.lastname,
      email: user.email,
      id: user._id,
    });
  });
};

// Signin
exports.signin = (req, res) => {
  const { email, password } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
    });
  }

  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      // err can be handled in a separate err
      return res.status(400).json({
        error: "User email does not exist",
      });
    }
    if (!user.authenticate(password)) {
      return res.status(400).json({
        error: "Email and password do not match",
      });
    }

    //Create token
    // const token = jwt.sign({ _id: user._id }, "shhh");
    const token = jwt.sign({ _id: user._id }, process.env.SECRET);

    //Put Token in cookie
    res.cookie("token", token), { expire: new Date() + 1 };

    //Send response to front-end
    const { _id, name, email, role } = user;
    return res.json({
      token,
      user: {
        _id,
        name,
        email,
        role,
      },
    });
  });
};

exports.signout = (req, res) => {
  res.clearCookie("token"); // These cookie methods are coming from cookieParser(). It clears cookie named 'token' as while setting
  res.json({
    message: "Come back soon... :)",
  });
};

//protected routes
exports.isSignedIn = expressJWT({
  secret: process.env.SECRET,
  userProperty: "auth",
});

//custom middlewares
exports.isAuthenticated = (req, res, next) => {
  let checker = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!checker) {
    return res.status(403).json({
      error: "ACCESS DENIED",
    });
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (req.profile.role === 0) {
    return res.status(403).json({
      error: "Restricted area. Only admin can access.",
    });
  }
  next();
};
