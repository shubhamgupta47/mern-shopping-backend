const express = require('express');
const router = express.Router();
const { check } = require('express-validator');  // To validate in the route itself

const { signup, signin, signout, isSignedIn } = require('../controllers/auth');

// Signup
router.post('/signup', [
  check('name', 'Name should be at least 2 characters').isLength({ min: 2 }),
  check('email', 'Email is required').isEmail(),
  check('password', 'Password should be at least 8 characters').isLength({ min: 8 })
], signup);

// Signin
router.post('/signin', [
  check('email', 'Email is required').isEmail(),
  check('password', 'Password is required').isLength({ min: 1 })
], signin);

// Signout
router.get('/signout', signout);

// Signout
router.get('/test', isSignedIn, (req, res) => {
  res.json(req.auth);
});

module.exports = router;