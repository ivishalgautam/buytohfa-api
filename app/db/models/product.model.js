"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk from "sequelize";

let ProductModel = null;

const init = async (sequelize) => {
  ProductModel = sequelize.define(
    constants.models.PRODUCT_TABLE,
    {
      id: {
        primaryKey: true,
        type: sequelizeFwk.DataTypes.UUID,
        allowNull: false,
        defaultValue: sequelizeFwk.DataTypes.UUIDV4,
        unique: true,
      },
      title: {
        type: sequelizeFwk.DataTypes.STRING,
        allowNull: false,
      },
      slug: {
        type: sequelizeFwk.DataTypes.TEXT,
        allowNull: false,
        unique: true,
      },
      description: {
        type: sequelizeFwk.DataTypes.TEXT,
        allowNull: false,
      },
      type: {
        type: sequelizeFwk.DataTypes.ENUM,
        values: ["personalized", "corporate"],
        allowNull: false,
      },
      moq: {
        type: sequelizeFwk.DataTypes.INTEGER,
        allowNull: true,
      },
      price: {
        type: sequelizeFwk.DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      category_id: {
        type: sequelizeFwk.DataTypes.UUID,
        allowNull: false,
        onDelete: "CASCADE",
        references: {
          model: constants.models.CATEGORY_TABLE,
          key: "id",
          deferrable: sequelizeFwk.Deferrable.INITIALLY_IMMEDIATE,
        },
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  await ProductModel.sync({ alter: true });
};

const create = async (req) => {
  return await ProductModel.create({
    title: req.body.title,
    description: req.body.description,
    slug: req.body.slug,
    type: req.body.type,
    moq: req.body.moq,
    price: req.body.price,
  });
};

const get = async (req) => {
  return await ProductModel.findAll({});
};

const updateById = async (req, id) => {
  const [rowCount, rows] = await ProductModel.update(
    {
      title: req.body.title,
      description: req.body.description,
      slug: req.body.slug,
      type: req.body.type,
      moq: req.body.moq,
      price: req.body.price,
    },
    {
      where: { id: req.params.id || id },
      returning: true,
      raw: true,
    }
  );

  if (rowCount === 0) {
    throw new Error("Product not found!");
  }
  return rows[0];
};

const updateBySlug = async (req, slug) => {
  return await ProductModel.update(
    {
      title: req?.body?.title,
      description: req?.body?.description,
      slug: req?.body?.slug,
      type: req?.body?.type,
      moq: req?.body?.moq,
      price: req?.body?.price,
    },
    {
      where: { slug: req.params.slug || slug },
      returning: true,
      raw: true,
    }
  );
};

const getById = async (req, id) => {
  return await ProductModel.findOne({
    where: { id: req.params.id || id },
    returning: true,
    raw: true,
  });
};

const getBySlug = async (req, slug) => {
  return await ProductModel.findOne({
    where: { slug: req.params.slug || slug },
    raw: true,
  });
};

const deleteById = async (req, id) => {
  return await ProductModel.destroy({
    where: {
      id: req.params.id || id,
    },
  });
};

export default {
  init: init,
  create: create,
  get: get,
  updateById: updateById,
  updateBySlug: updateBySlug,
  getById: getById,
  getBySlug: getBySlug,
  deleteById: deleteById,
};
