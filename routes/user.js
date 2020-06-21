const express = require('express');
const router = express.Router();

const {
  getUserById,
  getUser,
  updateUser,
  userPurchaseList,
  getAllUsers
} = require('../controllers/user');
const { isSignedIn, isAuthenticated, isAdmin } = require('../controllers/auth');

router.param('userId', getUserById);

router.get('/user/:userId', isSignedIn, isAuthenticated, getUser);
router.put('/user/:userId', isSignedIn, isAuthenticated, updateUser);
router.get('/user/:userId/orders', isSignedIn, isAuthenticated, userPurchaseList);


/**
 * 
 * Get All Users Route
 * 
 */
router.get('/users', getAllUsers);

module.exports = router;
