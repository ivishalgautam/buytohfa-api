"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk from "sequelize";

let ProductAttributeModel = null;

const init = async (sequelize) => {
  ProductAttributeModel = sequelize.define(
    constants.models.PRODUCT_ATTRIBUTE_TABLE,
    {
      id: {
        primaryKey: true,
        allowNull: false,
        type: sequelizeFwk.DataTypes.UUID,
        defaultValue: sequelizeFwk.DataTypes.UUIDV4,
        unique: true,
      },
      name: {
        type: sequelizeFwk.DataTypes.STRING,
        allowNull: false,
      },
      slug: {
        type: sequelizeFwk.DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  await ProductAttributeModel.sync({ alter: true });
};

const create = async (req) => {
  return await ProductAttributeModel.create({
    name: req.body.name,
    slug: req.body.slug,
  });
};

const get = async (req) => {
  let query = `
            SELECT
                pa.id,
                pa.name,
                pa.slug,
                jsonb_agg(jsonb_build_object(
                  'id', pat.id,
                  'name', pat.name,
                  'slug', pat.slug
                )) AS terms
              FROM 
            product_attributes pa
            LEFT JOIN product_attribute_terms pat ON pat.attribute_id = pa.id
            GROUP BY 
                pa.id,
                pa.name,
                pa.slug;
  `;

  return await ProductAttributeModel.sequelize.query(query, {
    type: sequelizeFwk.QueryTypes.SELECT,
  });
};

const update = async (req, id) => {
  const [rowCount, rows] = await ProductAttributeModel.update(
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
  return await ProductAttributeModel.findOne({
    where: {
      id: req.params.id || id,
    },
  });
};

const getBySlug = async (req, slug) => {
  return await ProductAttributeModel.findOne({
    where: {
      slug: req.params.slug || slug,
    },
    raw: true,
  });
};

const deleteById = async (req, id) => {
  return await ProductAttributeModel.destroy({
    where: { id: req.params.id || id },
  });
};

export default {
  init: init,
  create: create,
  get: get,
  update: update,
  getById: getById,
  getBySlug: getBySlug,
  deleteById: deleteById,
};
