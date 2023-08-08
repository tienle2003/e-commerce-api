import Product from "../models/product.js";
import { Op } from "sequelize";
import {
  uploadMultipleImage,
  deleteMutipleImages,
} from "../services/cloudinaryService.js";

const getAllProducts = async (req, res) => {
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

  if (quantity) {
    query.quantity = setFilter(quantity);
  }

  if (price) {
    query.price = setFilter(price);
  }

  if (search) {
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
  if (sort !== "" && sort !== undefined) {
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
  try {
    const products = await Product.findAndCountAll(paramQuerySQL);
    const totalPages = Math.ceil(products.count / limit);

    if (products.count === 0 || page > totalPages)
      return res.status(404).json({ message: "Products not found!" });
    return res
      .status(200)
      .json({ currentPage: +page, totalPages, data: products.rows });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error!" });
  }
};

const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findByPk(id);
    if (!product)
      return res.status(404).json({ message: "Product not found!" });
    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error!" });
  }
};

const createProduct = async (req, res) => {
  const { name, price, description, color, quantity, brand, sold } = req.body;
  let images = null;
  try {
    if (req.files) {
      const result = await uploadMultipleImage(req.files, {
        folder: "products",
        resource_type: "image",
      });
      images = result;
    }
    const product = await Product.create({
      name,
      price,
      description,
      color,
      quantity,
      brand,
      sold,
      images,
    });
    return res
      .status(201)
      .json({ message: "Product created successfully!", data: product });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error!" });
  }
};

const updateProductById = async (req, res) => {
  const { id } = req.params;
  const { name, price, description, color, quantity, sold, brand } = req.body;
  let images = null;
  try {
    const product = await Product.findByPk(id);
    if (!product)
      return res.status(404).json({ message: "Product not found!" });

    await deleteMutipleImages(product.images, "products");

    if (req.files) {
      console.log(req.files);
      const result = await uploadMultipleImage(req.files, {
        folder: "products",
        resource_type: "image",
      });
      images = result;
    }

    await product.update({
      name,
      price,
      description,
      color,
      quantity,
      sold,
      brand,
      images,
    });

    return res
      .status(200)
      .json({ message: "Product updated successfully!", data: product });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error!" });
  }
};

const deleteProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findByPk(id);

    if (!product)
      return res.status(404).json({ message: "Product not found!" });

    await product.destroy();
    return res.status(200).json({ message: "Product deleted successfully!" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error!" });
  }
};

export {
  getAllProducts,
  getProductById,
  createProduct,
  updateProductById,
  deleteProductById,
};
