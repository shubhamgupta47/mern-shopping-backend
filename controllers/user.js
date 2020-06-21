const Order = require('../models/order');
const User = require('../models/user');


exports.getUserById = (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'No user was found in the database'
      });
    }
    req.profile = user;
    next();
  });
};

exports.getUser = (req, res) => {
  req.profile.salt = undefined;
  req.profile.encry_password = undefined;
  return res.json(req.profile);
};

exports.updateUser = (req, res) => {
  User.findByIdAndUpdate(
    { _id: req.profile._id },
    { $set: req.body },
    { new: true, useFindAndModify: false },
    (err, updatedUser) => {
      if (err) {
        return res.status(404).json({
          error: 'User not found'
        });
      }
      updatedUser.salt = undefined;
      updatedUser.encry_password = undefined;
      return res.json(updatedUser)
    } 
  );
}

exports.userPurchaseList = (req, res) => {
  Order.find({ user: req.profile._id })
  .populate('user', '_id name')
  .exec((err, order) => {
    if(err) {
      return res.status(400).json({
        error: 'No active orders',
      });
    }
    return res.json(order);
  });
}

//Middleware
exports.pushOrderInPurchaseList = (req, res, next) => {
  let purchases = [];
  req.body.order.products.forEach(product => {
    purchases.push({
      _id: product._id,
      name: product.name,
      description: product.description,
      category: product.category,
      quantity: product.quantity,
      amount: req.body.order.amount,
      transaction_id: req.body.order.transaction_id
    });
  });

  //store this in DB
  User.findOneAndUpdate(
    {_id: req.profile._id},
    {$push: {purchases: purchases}},
    {new: true},
    (err, purchaseList) => {
      if(err) {
        return res.status(400).json({
          error: 'Unable to save purchase list'
        });
      }
      next();
    }
  );
};




/**
 *
 * Get All Users
 *
 */


exports.getAllUsers = (req, res) => {
  User.find().exec((err, users) => {
    if(err || !users) {
      return res.status(404).json({
        error: 'Users are not available'
      });
    };
    users.forEach(user => {
      user.salt = undefined;
      user.encry_password = undefined;
    })
    return res.json(users);
  });
};
