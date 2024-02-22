import Product from "../models/product.js";
import Category from "../models/category.js";
import { Op } from "sequelize";
import {
  uploadMultipleImage,
  deleteMutipleImages,
} from "../providers/cloudinary.js";
import asyncWrapper from "../utils/asyncWrapper.js";
import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

const getProducts = asyncWrapper(async (req, res) => {
  const {
    page = 1,
    limit = 5,
    sort,
    search,
    price,
    quantity,
    ...query
  } = req.query;
  const paramQuerySQL = {};

  // filter
  function setFilter(field) {
    return Array.isArray(field) ? { [Op.between]: field } : { [Op.lte]: field };
  }

  if (quantity !== null && quantity !== undefined && quantity !== "") {
    query.quantity = setFilter(quantity);
  }

  if (price !== null && price !== undefined && price !== "") {
    query.price = setFilter(price);
  }

  if (search !== null && search !== undefined && search !== "") {
    const searchQuery = {
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ],
      ...query,
    };
    paramQuerySQL.where = searchQuery;
  } else {
    paramQuerySQL.where = query;
  }
  //Sorting
  if (sort !== null && sort !== undefined && sort !== "") {
    const Fields = sort.split(",");
    const sortQuery = Fields.map((field) => {
      return field.startsWith("-")
        ? [field.replace("-", ""), "DESC"]
        : [field, "ASC"];
    });
    paramQuerySQL.order = sortQuery;
  }

  //Pagination
  paramQuerySQL.offset = (page - 1) * limit;
  paramQuerySQL.limit = +limit;
  const products = await Product.findAndCountAll(paramQuerySQL);
  const totalPages = Math.ceil(products.count / limit);

  if (products.count === 0 || page > totalPages)
    throw new ApiError(StatusCodes.NOT_FOUND, "Products not found!");
  res
    .status(StatusCodes.OK)
    .json({ currentPage: +page, totalPages, data: products.rows });
});

const getProductById = asyncWrapper(async (req, res) => {
  const { productId } = req.params;
  const product = await Product.findByPk(productId);
  if (!product)
    throw new ApiError(StatusCodes.NOT_FOUND, "Products not found!");
  res.status(StatusCodes.OK).json(product);
});

const createProduct = asyncWrapper(async (req, res) => {
  let images;
  if (req.files) {
    images = await uploadMultipleImage(req.files, {
      folder: "products",
      resource_type: "image",
    });
  }
  const product = await Product.create({
    ...req.body,
    images,
  });
  res
    .status(StatusCodes.OK)
    .json({ message: "Product created successfully!", data: product });
});

const updateProductById = asyncWrapper(async (req, res) => {
  const { productId } = req.params;
  const { categoryName, ...other } = req.body;
  let images;

  const category = await Category.findOne({ where: { name: categoryName } });
  if (!category)
    throw new ApiError(StatusCodes.NOT_FOUND, "Category not found!");

  const product = await Product.findByPk(productId);
  if (!product) throw new ApiError(StatusCodes.NOT_FOUND, "Product not found!");

  //delete old image on cloud
  if (product.images) await deleteMutipleImages(product.images, "products");

  if (req.files) {
    images = await uploadMultipleImage(req.files, {
      folder: "products",
      resource_type: "image",
    });
  }

  await product.update({
    ...other,
    images,
    category_id: category.id,
  });

  res
    .status(StatusCodes.OK)
    .json({ message: "Product updated successfully!", data: product });
});

const deleteProductById = asyncWrapper(async (req, res) => {
  const { productId } = req.params;
  const product = await Product.findByPk(productId);

  if (!product) throw new ApiError(StatusCodes.NOT_FOUND, "Product not found!");

  await product.destroy();
  res.status(StatusCodes.OK).json({ message: "Product deleted successfully!" });
});

export {
  getProducts,
  getProductById,
  createProduct,
  updateProductById,
  deleteProductById,
};
