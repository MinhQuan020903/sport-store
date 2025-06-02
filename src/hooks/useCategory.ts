import {
  getRequest,
  postRequest,
  putRequest,
  deleteRequest,
} from '@/lib/fetch';
import { z } from 'zod';

// Category schemas
export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
});

export const updateCategorySchema = categorySchema.partial().extend({
  id: z.string().uuid(),
});

export type CategoryQueryParams = {
  PageNumber?: number;
  PageSize?: number;
  Name?: string;
  SortBy?: string;
  OrderBy?: string;
};

export type GetCategoriesParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

// Map frontend params to backend params
const mapToApiParams = (params?: GetCategoriesParams): CategoryQueryParams => {
  if (!params) return {};

  return {
    PageNumber: params.page,
    PageSize: params.limit,
    Name: params.search,
    OrderBy: params.sortBy,
    SortBy: params.sortOrder,
  };
};

export const useCategory = () => {
  // Get all categories with pagination and filters
  const onGetCategories = async (params?: GetCategoriesParams) => {
    const apiParams = mapToApiParams(params);
    const queryString = new URLSearchParams(
      Object.entries(apiParams)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString();

    const response = await getRequest({
      endPoint: `/api/categories${queryString ? `?${queryString}` : ''}`,
    });
    return response;
  };

  // Get a single category by ID
  const onGetCategoryById = async (id: string) => {
    const response = await getRequest({
      endPoint: `/api/categories/${id}`,
    });
    return response;
  };

  // Create a new category
  const onCreateCategory = async (
    categoryData: z.infer<typeof categorySchema>
  ) => {
    const validation = categorySchema.safeParse(categoryData);
    if (!validation.success) {
      throw new Error(
        'Validation failed: ' + JSON.stringify(validation.error.format())
      );
    }

    const response = await postRequest({
      endPoint: '/api/categories',
      formData: categoryData,
      isFormData: false,
    });
    return response;
  };

  // Update an existing category
  const onUpdateCategory = async (
    id: string,
    categoryData: z.infer<typeof updateCategorySchema>
  ) => {
    const validation = updateCategorySchema.partial().safeParse(categoryData);
    if (!validation.success) {
      throw new Error(
        'Validation failed: ' + JSON.stringify(validation.error.format())
      );
    }

    const response = await putRequest({
      endPoint: `/api/categories/${id}`,
      formData: categoryData,
      isFormData: false,
    });
    return response;
  };

  // Delete a category
  const onDeleteCategory = async (id: string) => {
    const response = await deleteRequest({
      endPoint: `/api/categories/${id}`,
    });
    return response;
  };

  return {
    onGetCategories,
    onGetCategoryById,
    onCreateCategory,
    onUpdateCategory,
    onDeleteCategory,
  };
};
