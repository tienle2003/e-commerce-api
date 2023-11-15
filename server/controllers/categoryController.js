import Category from "../models/category.js";
import Product from "../models/product.js";
import asyncWrapper from "../utils/asyncWrapper.js";
import ApiError from "../utils/apiError.js";
import { StatusCodes } from "http-status-codes";

const createCategory = asyncWrapper(async (req, res) => {
  const { name } = req.body;
  const existingCategory = await Category.findOne({ where: { name } });
  if (existingCategory)
    throw new ApiError(StatusCodes.BAD_REQUEST, "This category already exists");
  const newCategory = await Category.create({ name });
  res
    .status(StatusCodes.CREATED)
    .json({ message: "Category created successfully", data: newCategory });
});

const deleteCategory = asyncWrapper(async (req, res) => {
  const { categoryId } = req.params;
  //find the category to delete
  const categoryToDelete = await Category.findByPk(categoryId);
  if (!categoryToDelete)
    throw new ApiError(StatusCodes.NOT_FOUND, "Category not found");

  //check if the unknown category already exists
  const unknownCategory = await Category.findOne({
    where: { name: "unknown" },
  });
  //if not, creat a new category named unknown
  if (!unknownCategory)
    unknownCategory = await Category.create({ name: "unknown" });

  //move all products from categoryToDelete to unknownCategory
  await Product.update(
    { category_id: unknownCategory.id },
    { where: { category_id: categoryToDelete.id } }
  );

  await categoryToDelete.destroy();
  res.status(StatusCodes.OK).json({ message: "Category deleted successfully" });
});

const getAllCategories = asyncWrapper(async (req, res) => {
  const categories = await Category.findAll({ attributes: ["name"] });
  if (categories.length === 0)
    throw new ApiError(StatusCodes.NOT_FOUND, "No categories found");
  res.status(StatusCodes.OK).json(categories);
});

export { createCategory, deleteCategory, getAllCategories };
