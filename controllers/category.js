const Category = require('../models/category');

//get category by id middleware method, fires when category id is passed as params
exports.getCategoryById = (req, res, next, id) => {
  Category.findById(id).exec((err, category) => {
    if (err) {
      return res.status(400).json({
        error: 'Category not found'
      });
    }
    req.category = category;
    next();
  });
}

exports.createCategory = (req, res) => {
  const category = new Category(req.body);
  category.save((err, category) => {
    if (err) {
      return res.status(400).json({
        error: 'Category could NOT be saved'
      });
    }

    res.json({
      category
    });
  });
}

//get single category
exports.getCategory = (req, res) => {
  return res.json(req.category);
}

//get all categories
exports.getAllCategory = (req, res) => {
  Category.find().exec((err, categories) => {
    if (err) {
      return res.status(400).json({
        error: 'Categories are not available'
      });
    }
    res.json(categories);
  });
}

exports.updateCategory = (req, res) => {
  const category = req.category;
  category.name = req.body.name;

  category.save((err, updatedCategory) => {
    if (err) {
      return res.status(400).json({
        error: 'Failed to update category'
      });
    }
    res.json(updatedCategory);
  });
};

//Delete
exports.deleteCategory = (req, res) => {
  const category = req.category;

  category.remove((err, removedCategory) => {
    if (err) {
      return res.status(400).json({
        error: 'Category could not be deleted'
      });
    }
    res.json({
      message: 'Successfully Deleted'
    });
  });
};

