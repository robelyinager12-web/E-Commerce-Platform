// ... existing fetchProducts / fetchProductBySlug unchanged, then:

export interface CreateProductInput {
  name: string;
  description?: string;
  basePrice: number;
  sku: string;
  stockQuantity?: number;
  categoryIds?: string[];
  imageUrl?: string;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  basePrice?: number;
  stockQuantity?: number;
  isActive?: boolean;
  categoryIds?: string[];
}

export async function createProductAdmin(input: CreateProductInput): Promise<ProductDetail> {
  const response = await api.post<ApiResponse<ProductDetail>>("/products", input);
  return response.data.data;
}

export async function updateProductAdmin(
  id: string,
  input: UpdateProductInput
): Promise<ProductDetail> {
  const response = await api.patch<ApiResponse<ProductDetail>>(`/products/${id}`, input);
  return response.data.data;
}

export async function deactivateProductAdmin(id: string): Promise<void> {
  await api.delete(`/products/${id}`);
}