import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.util";
import { sendSuccess } from "../utils/response.util";
import {
  listCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/category.service";

export const getCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await listCategories();
  sendSuccess(res, "Categories retrieved", categories);
});

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await getCategoryBySlug(req.params.slug);
  sendSuccess(res, "Category retrieved", category);
});

export const postCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, imageUrl, parentId } = req.body;
  const category = await createCategory({ name, description, imageUrl, parentId });
  sendSuccess(res, "Category created successfully", category, 201);
});

export const patchCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, imageUrl, parentId, isActive } = req.body;
  const category = await updateCategory(req.params.id, {
    name,
    description,
    imageUrl,
    parentId,
    isActive,
  });
  sendSuccess(res, "Category updated successfully", category);
});

export const removeCategory = asyncHandler(async (req: Request, res: Response) => {
  await deleteCategory(req.params.id);
  sendSuccess(res, "Category deactivated successfully");
});