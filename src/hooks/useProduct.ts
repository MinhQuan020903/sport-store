import { getRequest } from '@/lib/fetch';
import { postRequest, putRequest, deleteRequest } from '@/lib/fetch';
import { type z } from 'zod';
import {
  productSchema,
  updateProductSchema,
  getProductsSchema,
  type GetProductsParams,
} from '@/lib/validations/product';

// Backend API parameter types for better type safety
export type ProductQueryParams = {
  PageNumber?: number;
  PageSize?: number;
  Name?: string;
  Category?: string;
  MinPrice?: number;
  MaxPrice?: number;
  OrderBy?: string;
  SortBy?: string;
};

// Map frontend params to backend params
const mapToApiParams = (params?: GetProductsParams): ProductQueryParams => {
  if (!params) return {};

  return {
    PageNumber: params.page,
    PageSize: params.limit,
    Name: params.search,
    Category: params.categoryId,
    MinPrice: params.minPrice,
    MaxPrice: params.maxPrice,
    OrderBy: params.sortBy,
    SortBy: params.sortOrder,
  };
};

export const useProduct = () => {
  // Get all products with pagination and filters
  const onGetProducts = async (params?: GetProductsParams) => {
    const apiParams = mapToApiParams(params);
    const queryString = new URLSearchParams(
      Object.entries(apiParams)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString();

    const response = await getRequest({
      endPoint: `/api/products${queryString ? `?${queryString}` : ''}`,
    });
    return response;
  };

  // Get a single product by ID
  const onGetProductById = async (id: string) => {
    const response = await getRequest({
      endPoint: `/api/products/${id}`,
    });
    return response;
  };

  // Create a new product
  const onCreateProduct = async (
    productData: z.infer<typeof productSchema>
  ) => {
    const validation = productSchema.safeParse(productData);
    if (!validation.success) {
      throw new Error(
        'Validation failed: ' + JSON.stringify(validation.error.format())
      );
    }

    const response = await postRequest({
      endPoint: '/api/products',
      formData: productData,
      isFormData: false,
    });
    return response;
  };

  // Update an existing product
  const onUpdateProduct = async (
    id: string,
    productData: z.infer<typeof updateProductSchema>
  ) => {
    const validation = updateProductSchema.partial().safeParse(productData);
    if (!validation.success) {
      throw new Error(
        'Validation failed: ' + JSON.stringify(validation.error.format())
      );
    }

    const response = await putRequest({
      endPoint: `/api/products/${id}`,
      formData: productData,
      isFormData: false,
    });
    return response;
  };

  // Delete a product
  const onDeleteProduct = async (id: string) => {
    const response = await deleteRequest({
      endPoint: `/api/products/${id}`,
    });
    return response;
  };

  // Get photos for a product
  const onGetProductPhotos = async (productId: string) => {
    const response = await getRequest({
      endPoint: `/api/products/${productId}/photos`,
    });
    return response;
  };

  // Add a photo to a product
  const onAddProductPhoto = async (productId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await postRequest({
      endPoint: `/api/products/${productId}/photos`,
      formData,
      isFormData: true,
    });
    return response;
  };

  // Set a photo as the main photo
  const onSetMainProductPhoto = async (productId: string, photoId: string) => {
    const response = await putRequest({
      endPoint: `/api/products/${productId}/photos/${photoId}/set-main`,
      formData: {},
      isFormData: false,
    });
    return response;
  };

  // Delete a photo
  const onDeleteProductPhoto = async (productId: string, photoId: string) => {
    const response = await deleteRequest({
      endPoint: `/api/products/${productId}/photos/${photoId}`,
    });
    return response;
  };

  return {
    onGetProducts,
    onDeleteProductPhoto,
    onSetMainProductPhoto,
    onAddProductPhoto,
    onGetProductPhotos,
    onDeleteProduct,
    onUpdateProduct,
    onCreateProduct,
    onGetProductById,
  };
};
