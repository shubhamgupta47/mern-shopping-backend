const Product = require('../models/Product');
const formidable = require('formidable');
const _ = require('lodash');
const fs = require('fs');


exports.getProductById = (req, res, next, id) => {
  Product.findById(id)
  .populate('category')
  .exec((err, product) => {
    if (err) {
      return res.status(400).json({
        error: 'This product was not found in the database'
      });
    }
    req.product = product;
    next();
  });
};

exports.createProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if(err) {
      return res.status(400).json({
        error: 'There is some problem with the uploaded file'
      });
    }

    //destructure fields
    const {
      name,
      description,
      price,
      category,
      stock
    } = fields;

    if (!name || !description || !price || !category || !stock) {
      return res.status(400).json({
        error: 'Please fill all fields'
      });
    }

    let product = new Product(fields);
    //handle file here
    if(file.photo) {
      if(file.photo.size > 3000000) {
        return res.status(400).json({
          error: "File size is too large! (Max Size: 2mb approx.)"
        })
      }

      product.photo.data = fs.readFileSync(file.photo.path);
      product.photo.contentType = file.photo.type;
    }

    //Save to db
    product.save((err, product) => {
      if(err) {
        return res.status(400).json({
          error: 'This product could not be saved.'
        });
      }

      res.json(product);
    });
  });
}


//GET PRODUCT
exports.getProduct = (req, res) => {
  req.product.photo = undefined; // We do not send it in a normal get request with other data as it is bulky, we define a middleware
  return res.json(req.product);
}

// Send photo middleware
exports.photo = (req, res, next) => {
  if(req.product.photo.data) {
    res.set('Content-Type', req.product.photo.contentType);
    return res.send(req.product.photo.data);
  }
  next();
}

//Delete Product
exports.deleteProduct = (req, res) => {
  let product = req.product;
  product.remove((err, deletedProduct) => {
    if(err) {
      return res.status(400).json({
        error: 'Failed to delete the product'
      });
    }
    res.json({
      message: 'Deleted Successfully',
      deletedProduct
    });
  });
}


//Update Product
exports.updateProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if(err) {
      return res.status(400).json({
        error: 'There is some problem with the uploaded file'
      });
    }

    //updation actually goes here
    let product = req.product;
    product = _.extend(product, fields)

    //handle file here
    if(file.photo) {
      if(file.photo.size > 3000000) {
        return res.status(400).json({
          error: "File size is too large! (Max Size: 2mb approx.)"
        })
      }

      product.photo.data = fs.readFileSync(file.photo.path);
      product.photo.contentType = file.photo.type;
    }

    //Save to db
    product.save((err, product) => {
      if(err) {
        return res.status(400).json({
          error: 'Updation of product failed'
        });
      }

      res.json(product);
    });
  });
}

//Product Listing
exports.getAllProduct = (req, res) => {
  let limit = parseInt(req.query.limit) || 8;
  let sortBy = parseInt(req.query.sortBy) || '_id';

  Product
  .find()
  .populate('category')
  .select('-photo') // - sign means except the property after it
  .sort([[sortBy, 'asc']])
  .limit(limit)
  .exec((err, products) => {
    if(err) {
      return res.status(400).json({
        error: 'No product available'
      })
    }

    res.json(products);
  });
}

exports.getAllUniqueCategories = (req, res) => {
  Product.distinct('category', {}, (err, category) => {
    if(err) {
      return res.status(400).json({
        error: "No Category found"
      });
    }
    res.json(category);
  });
}


//Update stock in bulk
exports.updateStock = (req, res, next) => {
  
  let myOperations = req.body.order.products.map(product => {
    return {
      updateOne: {
        filter: {_id: product._id},
        update: {$inc: {stock: product.count, sold: +product.count}}
      }
    }
  });

  Product.bulkWrite(myOperations, {}, (err, products) => {
    if(err) {
      return res.status(400).json({
        error: 'Bulk Operation failed'
      });
    }
    next();
  });
}
