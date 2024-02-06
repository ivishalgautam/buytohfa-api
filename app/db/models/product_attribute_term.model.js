"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk from "sequelize";

let ProductAttributeTermModel = null;

const init = async (sequelize) => {
  ProductAttributeTermModel = sequelize.define(
    constants.models.PRODUCT_ATTRIBUTE_TERM_TABLE,
    {
      id: {
        primaryKey: true,
        allowNull: false,
        type: sequelizeFwk.DataTypes.UUID,
        defaultValue: sequelizeFwk.DataTypes.UUIDV4,
        unique: true,
      },
      attribute_id: {
        type: sequelizeFwk.DataTypes.UUID,
        onDelete: "CASCADE",
        allowNull: false,
        references: {
          model: constants.models.PRODUCT_ATTRIBUTE_TABLE,
          key: "id",
          deferrable: sequelizeFwk.Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      name: {
        type: sequelizeFwk.DataTypes.STRING,
        allowNull: false,
      },
      slug: {
        type: sequelizeFwk.DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  await ProductAttributeTermModel.sync({ alter: true });
};

const create = async (req) => {
  return await ProductAttributeTermModel.create({
    name: req.body.name,
    slug: req.body.slug,
    attribute_id: req.body.attribute_id,
  });
};

const get = async (req) => {
  return await ProductAttributeTermModel.findAll({
    order: [["created_at", "DESC"]],
  });
};

const update = async (req, id) => {
  const [rowCount, rows] = await ProductAttributeTermModel.update(
    {
      name: req.body.name,
      slug: req.body.slug,
    },
    {
      where: {
        id: req.params.id || id,
      },
      returning: true,
      raw: true,
    }
  );

  return rows[0];
};

const getById = async (req, id) => {
  return await ProductAttributeTermModel.findOne({
    where: {
      id: req.params.id || id,
    },
  });
};

const getByAttributeId = async (req, id) => {
  return await ProductAttributeTermModel.findAll({
    where: {
      attribute_id: req.params.id || id,
    },
  });
};

const getBySlug = async (req, slug) => {
  return await ProductAttributeTermModel.findOne({
    where: {
      slug: req.params.slug || slug,
    },
    raw: true,
  });
};

const deleteById = async (req, id) => {
  return await ProductAttributeTermModel.destroy({
    where: { id: req.params.id || id },
  });
};

export default {
  init: init,
  create: create,
  get: get,
  update: update,
  getById: getById,
  getByAttributeId: getByAttributeId,
  getBySlug: getBySlug,
  deleteById: deleteById,
};
