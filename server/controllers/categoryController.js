import Category from "../models/category.js";
import Product from "../models/product.js";

const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const existingCategory = await Category.findOne({ where: { name } });
    if (existingCategory)
      return res.status(400).json({ message: "This category already exists" });
    const newCategory = await Category.create({ name });
    return res
      .status(201)
      .json({ message: "Category created successfully", data: newCategory });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error!" });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    //find the category to delete
    const categoryToDelete = await Category.findByPk(categoryId);
    if (!categoryToDelete)
      return res.status(404).json({ message: "Category not found" });

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
    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error!" });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({ attributes: ["name"] });
    if (categories.length === 0)
      return res.status(404).json({ message: "No categories found" });
    return res.status(200).json(categories);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error!" });
  }
};

export { createCategory, deleteCategory, getAllCategories };
