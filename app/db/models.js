"use strict";
import userModel from "./models/user.model.js";
import productModel from "./models/product.model.js";
import categoryModel from "./models/category.model.js";
import productAttributeModel from "./models/product_attribute.model.js";
import productAttributeTermModel from "./models/product_attribute_term.model.js";

export default {
  UserModel: userModel,
  ProductModel: productModel,
  CategoryModel: categoryModel,
  ProductAttributeModel: productAttributeModel,
  ProductAttributeTermModel: productAttributeTermModel,
};
