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
      discounts: {
        type: sequelizeFwk.DataTypes.JSONB,
        defaultValue: [],
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
      sale_price: {
        type: sequelizeFwk.DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      weight: {
        type: sequelizeFwk.DataTypes.INTEGER,
        allowNull: false,
      },
      weight_measurement: {
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
      hsn_code: {
        type: sequelizeFwk.DataTypes.STRING,
        allowNull: false,
      },
      is_featured: {
        type: sequelizeFwk.DataTypes.BOOLEAN,
        defaultValue: false,
      },
      meta_title: {
        type: sequelizeFwk.DataTypes.STRING,
        allowNull: false,
      },
      meta_description: {
        type: sequelizeFwk.DataTypes.TEXT,
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
      attributes: {
        type: sequelizeFwk.DataTypes.JSONB,
        defaultValue: "[]",
      },
      is_published: {
        type: sequelizeFwk.DataTypes.BOOLEAN,
        defaultValue: false,
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
    sale_price: req.body.sale_price,
    weight: req.body.weight,
    weight_measurement: req.body.weight_measurement,
    gst: req.body.gst,
    category_id: req.body.category_id,
    sku_id: req.body.sku_id,
    hsn_code: req.body.hsn_code,
    quantity: req.body.quantity,
    discounts: req.body.discounts,
    meta_title: req.body.meta_title,
    meta_description: req.body.meta_description,
    attribute_id: req.body?.attribute_id,
    product_id: product_id,
  });
};

const get = async (req) => {
  let whereQuery = `WHERE prd.product_id IS null`;

  if (req?.user_data?.role !== "admin") {
    // whereClause.is_published = true;
    whereQuery += ` AND prd.is_published IS true`;
  }

  let query = `
        SELECT
            prd.id, prd.title, prd.description, prd.pictures, prd.tags, prd.slug, prd.type, prd.moq, prd.price::integer, prd.sale_price::integer, prd.weight, prd.gst, 
            prd.category_id, prd.sku_id, prd.quantity, prd.is_published, prd.meta_title, prd.meta_description, prd.discounts, prd.hsn_code, prd.weight_measurement,
            cat.name as category_name,
            jsonb_agg(jsonb_build_object(
                'id', pat.id,
                'value', pat.name,
                'sale_price', pv.sale_price,
                'price', pv.price,
                'image_path', pic->>'image_path',
                'attribute', json_build_object(
                  'id', pa.id,
                  'name', pa.name,
                  'slug', pa.slug
                )
            )) AS variants
        FROM 
        products prd
        LEFT JOIN LATERAL (
          SELECT jsonb_build_object('image_path', value)::jsonb AS pic
          FROM unnest(prd.pictures) AS u(value)
          LIMIT 1
        ) AS pic ON true
        LEFT JOIN products pv ON pv.product_id = prd.id
        LEFT JOIN product_attribute_terms pat ON pat.id = pv.attribute_id
        LEFT JOIN product_attributes pa ON pa.id = pat.attribute_id
        LEFT JOIN categories cat ON cat.id = prd.category_id
        ${whereQuery}
        GROUP BY
            prd.id, prd.title, prd.description, prd.pictures, prd.tags, prd.slug, prd.type, prd.moq, prd.price, prd.sale_price, prd.weight, prd.gst, 
            prd.category_id, prd.sku_id, prd.quantity, prd.is_published, prd.meta_title, prd.meta_description, prd.discounts, prd.hsn_code, prd.weight_measurement,
            cat.name;
`;

  return await ProductModel.sequelize.query(query, {
    type: sequelizeFwk.QueryTypes.SELECT,
    raw: true,
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
      sale_price: req?.body?.sale_price,
      category_id: req.body.category_id,
      weight: req.body.weight,
      weight_measurement: req.body.weight_measurement,
      gst: req.body.gst,
      sku_id: req.body.sku_id,
      hsn_code: req.body.hsn_code,
      quantity: req.body.quantity,
      meta_title: req.body.meta_title,
      meta_description: req.body.meta_description,
      discounts: req.body.discounts,
      pictures: req.body.pictures,
      attribute_id: req.body.attribute_id,
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

const getById = async (req, id) => {
  let query = `
        SELECT
            prd.title, prd.variant_title, prd.description, prd.pictures, prd.tags, prd.slug, prd.type, prd.moq, prd.price::integer, prd.sale_price::integer, 
            prd.weight, prd.gst, prd.category_id, prd.sku_id, prd.quantity, prd.meta_title, prd.meta_description, prd.discounts, prd.hsn_code, prd.weight_measurement,
            jsonb_agg(jsonb_build_object(
              'id', pv.id,
              'attribute_id', pv.attribute_id,
              'name', pv.variant_title,
              'attribute_name', pat.name,
              'sale_price', pv.sale_price,
              'price', pv.price,
              'quantity', pv.quantity,
              'sku_id', pv.sku_id,
              'weight', pv.weight,
              'image_path', pic->>'image_path'
            )) AS variants
        FROM 
        products prd
        LEFT JOIN products pv ON pv.product_id = prd.id
        LEFT JOIN product_attribute_terms pat ON pat.id = prd.attribute_id
        LEFT JOIN LATERAL (
          SELECT jsonb_build_object('image_path', value)::jsonb AS pic
          FROM unnest(pv.pictures) AS u(value)
          LIMIT 1
        ) AS pic ON true
        WHERE prd.id = '${req.params.id || id}'
        GROUP BY 
            prd.title, prd.variant_title, prd.description, prd.pictures, prd.tags, prd.slug, prd.type, prd.moq, prd.price, prd.sale_price, 
            prd.weight, prd.gst, prd.category_id, prd.sku_id, prd.quantity, prd.meta_title, prd.meta_description, prd.discounts, prd.hsn_code, prd.weight_measurement;
`;

  return await ProductModel.sequelize.query(query, {
    type: sequelizeFwk.QueryTypes.SELECT,
    plain: true,
  });
};

const getBySlug = async (req, slug) => {
  let query = `
        SELECT
          prd.id, prd.title, prd.description, prd.pictures, prd.tags, prd.slug, prd.type, prd.moq, prd.price::integer, prd.sale_price::integer, prd.weight, prd.gst, 
          prd.category_id, prd.sku_id, prd.quantity, prd.meta_title, prd.meta_description, prd.discounts, prd.hsn_code, prd.weight_measurement,
          cat.name as category_name,
          jsonb_agg(jsonb_build_object(
            'id', pat.id,
            'value', pat.name,
            'sale_price', pv.sale_price,
            'price', pv.price,
            'slug', pv.slug,
            'image_path', pic->>'image_path',
            'attribute', json_build_object(
              'id', pa.id,
              'name', pa.name,
              'slug', pa.slug
            )
          )) AS variants
        FROM
        products prd
        LEFT JOIN LATERAL (
          SELECT jsonb_build_object('image_path', value)::jsonb AS pic
          FROM unnest(prd.pictures) AS u(value)
          LIMIT 1
        ) AS pic ON true
        LEFT JOIN products pv ON pv.product_id = prd.id OR pv.product_id = prd.product_id
        LEFT JOIN product_attribute_terms pat ON pat.id = pv.attribute_id
        LEFT JOIN product_attributes pa ON pa.id = pat.attribute_id
        LEFT JOIN categories cat ON cat.id = prd.category_id
        WHERE prd.slug = '${req.params.slug || slug}'
        GROUP BY 
          prd.id, prd.title, prd.description, prd.pictures, prd.tags, prd.slug, prd.type, prd.moq, prd.price, prd.sale_price, prd.weight, prd.gst,
          prd.category_id, prd.sku_id, prd.quantity, prd.meta_title, prd.meta_description, prd.discounts, prd.hsn_code, prd.weight_measurement,
          cat.name;
`;
  return await ProductModel.sequelize.query(query, {
    type: sequelizeFwk.QueryTypes.SELECT,
    plain: true,
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

const publishProductById = async (id, value) => {
  const [rowCount, rows] = await ProductModel.update(
    {
      is_published: value,
    },
    {
      where: {
        id: id,
      },
      returning: true,
      plain: true,
      raw: true,
    }
  );

  return rows;
};

export default {
  init: init,
  create: create,
  get: get,
  updateById: updateById,
  getById: getById,
  getBySlug: getBySlug,
  deleteById: deleteById,
  getVariantsBySlug: getVariantsBySlug,
  publishProductById: publishProductById,
};
