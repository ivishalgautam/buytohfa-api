"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk from "sequelize";

let ProductCommentModel = null;

const init = async (sequelize) => {
  ProductCommentModel = sequelize.define(
    constants.models.PRODUCT_COMMENT_TABLE,
    {
      id: {
        primaryKey: true,
        allowNull: false,
        type: sequelizeFwk.DataTypes.UUID,
        defaultValue: sequelizeFwk.DataTypes.UUIDV4,
        unique: true,
      },
      comment: {
        type: sequelizeFwk.DataTypes.STRING,
        allowNull: false,
      },
      user_id: {
        type: sequelizeFwk.DataTypes.UUID,
        allowNull: false,
        onDelete: "CASCADE",
        references: {
          model: constants.models.USER_TABLE,
          key: "id",
          deferrable: sequelizeFwk.Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      product_id: {
        type: sequelizeFwk.DataTypes.UUID,
        allowNull: false,
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

  await ProductCommentModel.sync({ alter: true });
};

const create = async (req) => {
  return await ProductCommentModel.create({
    comment: req.body.comment,
    product_id: req.body.product_id,
    user_id: req.body.user_id,
  });
};

const getByProductId = async (req, product_id) => {
  let query = `
        SELECT 
            p.*,
            CONCAT(usr.first_name, " ", usr.last_name) as user_fullname,
            usr.image_url as user_image,
        FROM PRODUCT_COMMENT_TABLEs pc
        LEFT JOIN users usr ON usr.id = pc.user_id
        LEFT JOIN products prd ON prd.id = pc.product_id
        WHERE pc.product_id = '${req.params.id || product_id}'
        ORDER BY pc.created_at DESC
    `;
  return await ProductCommentModel.sequelize.query(query, {
    type: sequelizeFwk.QueryTypes.SELECT,
  });
};

const update = async (req, id) => {
  const [rowCount, rows] = await ProductCommentModel.update(
    {
      comment: req.body.comment,
      product_id: req.body.product_id,
      user_id: req.body.user_id,
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
  return await ProductCommentModel.findOne({
    where: {
      id: req.params.id || id,
    },
  });
};

const deleteById = async (req, id) => {
  return await ProductCommentModel.destroy({
    where: { id: req.params.id || id },
  });
};

export default {
  init: init,
  create: create,
  getByProductId: getByProductId,
  update: update,
  getById: getById,
  deleteById: deleteById,
};
