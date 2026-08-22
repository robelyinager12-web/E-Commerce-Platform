import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.util";
import { sendSuccess } from "../utils/response.util";
import {
  listProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  ListProductsFilters,
} from "../services/product.service";

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const filters: ListProductsFilters = {
    category: req.query.category as string | undefined,
    search: req.query.search as string | undefined,
    minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
    maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
    sort: req.query.sort as ListProductsFilters["sort"],
  };

  const { items, meta } = await listProducts(req.query as Record<string, unknown>, filters);
  sendSuccess(res, "Products retrieved", { items, meta });
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await getProductBySlug(req.params.slug);
  sendSuccess(res, "Product retrieved", product);
});

export const postProduct = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, basePrice, sku, stockQuantity, categoryIds, imageUrl } = req.body;
  const product = await createProduct({
    name,
    description,
    basePrice,
    sku,
    stockQuantity,
    categoryIds,
    imageUrl,
  });
  sendSuccess(res, "Product created successfully", product, 201);
});

export const patchProduct = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, basePrice, stockQuantity, isActive, categoryIds } = req.body;
  const product = await updateProduct(req.params.id, {
    name,
    description,
    basePrice,
    stockQuantity,
    isActive,
    categoryIds,
  });
  sendSuccess(res, "Product updated successfully", product);
});

export const removeProduct = asyncHandler(async (req: Request, res: Response) => {
  await deleteProduct(req.params.id);
  sendSuccess(res, "Product deactivated successfully");
});