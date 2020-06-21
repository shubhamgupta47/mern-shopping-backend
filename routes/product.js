const express = require('express');
const router = express.Router();

const {
  getProductById,
  createProduct,
  getProduct,
  photo,
  updateProduct,
  deleteProduct,
  getAllProduct,
  getAllUniqueCategories
} = require('../controllers/product');
const { isSignedIn, isAuthenticated, isAdmin } = require('../controllers/auth');
const { getUserById } = require('../controllers/user');

//All of parama
router.param('productId', getProductById);
router.param('userId', getUserById);


//All the routes
router.post('/product/create/:userId', isSignedIn, isAuthenticated, isAdmin, createProduct);

router.get('/product/:productId', getProduct);
router.get('/product/photo/:productId', photo);

router.delete('/product/:productId/:userId', isSignedIn, isAuthenticated, isAdmin, deleteProduct);

router.put('/product/:productId/:userId', isSignedIn, isAuthenticated, isAdmin, updateProduct);


//listing route for return 'x' no. of products at a time
router.get('/products', getAllProduct);

router.get('/products/categories', getAllUniqueCategories);




//Exporting...
module.exports = router;
