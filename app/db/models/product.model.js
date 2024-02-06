"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk, { where } from "sequelize";

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
      variant_title: {
        type: sequelizeFwk.DataTypes.STRING,
        allowNull: true,
      },
      slug: {
        type: sequelizeFwk.DataTypes.TEXT,
        allowNull: true,
        unique: true,
      },
      description: {
        type: sequelizeFwk.DataTypes.TEXT,
        allowNull: false,
      },
      pictures: {
        type: sequelizeFwk.DataTypes.ARRAY(sequelizeFwk.DataTypes.TEXT),
        default: [],
      },
      tags: {
        type: sequelizeFwk.DataTypes.ARRAY(sequelizeFwk.DataTypes.STRING),
        default: [],
      },
      quantity: {
        type: sequelizeFwk.DataTypes.INTEGER,
        allowNull: false,
      },
      type: {
        type: sequelizeFwk.DataTypes.ENUM,
        values: ["personalized", "corporate"],
        allowNull: false,
      },
      moq: {
        type: sequelizeFwk.DataTypes.INTEGER,
        defaultValue: 0,
      },
      price: {
        type: sequelizeFwk.DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      discounted_price: {
        type: sequelizeFwk.DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      weight: {
        type: sequelizeFwk.DataTypes.STRING,
        allowNull: false,
      },
      gst: {
        type: sequelizeFwk.DataTypes.STRING,
        allowNull: false,
      },
      sku_id: {
        type: sequelizeFwk.DataTypes.STRING,
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
      product_id: {
        type: sequelizeFwk.DataTypes.UUID,
        allowNull: true,
        onDelete: "CASCADE",
        references: {
          model: constants.models.PRODUCT_TABLE,
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

const create = async (req, product_id = null) => {
  // return console.log({ body: req.body });
  return await ProductModel.create({
    title: req.body.title,
    variant_title: req?.body?.variant_title,
    description: req.body.description,
    pictures: req.body.pictures,
    tags: req.body.tags,
    slug: req.body.slug,
    type: req.body.type,
    moq: req.body.moq,
    price: req.body.price,
    discounted_price: req.body.discounted_price,
    weight: req.body.weight,
    gst: req.body.gst,
    category_id: req.body.category_id,
    sku_id: req.body.sku_id,
    quantity: req.body.quantity,
    product_id: product_id,
  });
};

const get = async (req) => {
  return await ProductModel.findAll({
    where: { product_id: null },
  });
};

const updateById = async (req, id) => {
  const [rowCount, rows] = await ProductModel.update(
    {
      title: req?.body?.title,
      description: req?.body?.description,
      slug: req?.body?.slug,
      type: req?.body?.type,
      moq: req?.body?.moq,
      tags: req?.body?.tags,
      price: req?.body?.price,
      discounted_price: req?.body?.discounted_price,
      category_id: req.body.category_id,
      weight: req.body.weight,
      gst: req.body.gst,
      sku_id: req.body.sku_id,
      quantity: req.body.quantity,
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
      tags: req?.body?.tags,
      price: req?.body?.price,
      discounted_price: req?.body?.discounted_price,
      category_id: req.body.category_id,
      weight: req.body.weight,
      gst: req.body.gst,
      sku_id: req.body.sku_id,
      quantity: req.body.quantity,
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
  return await ProductModel.findAll({
    where: { slug: req.params.slug || slug },
  });
};

const getVariantsBySlug = async (req, slug) => {
  const query = `
                SELECT
                    p.*,
                    pv.variant_title,
                    cat.name as category_name
                  FROM
                    products p
                    LEFT JOIN products pv on pv.product_id = p.id
                    LEFT JOIN categories cat on p.category_id = cat.id
                    WHERE p.slug = '${req.params.slug || slug}'
                `;
  return await ProductModel.sequelize.query(query, {
    type: sequelizeFwk.QueryTypes.SELECT,
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
  getVariantsBySlug: getVariantsBySlug,
};
