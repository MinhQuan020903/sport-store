import { z } from 'zod';

// Schema for product photos
export const productPhotoSchema = z.object({
  id: z.string().uuid().optional(), // Optional for creation
  url: z.string().url(),
  publicId: z.string().optional().nullable(),
  isMain: z.boolean().default(false),
  productId: z.string().uuid().optional(), // Optional for creation
  userId: z.string().uuid().optional().nullable(),
});

// Schema for product categories
export const productCategorySchema = z.object({
  categoryId: z.string().uuid(),
  productId: z.string().uuid().optional(), // Optional for creation
});

// Schema for creating a new product
export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be positive'),
  inStock: z.number().int().nonnegative('Stock cannot be negative'),
  photos: z.array(productPhotoSchema).optional().default([]),
  categories: z.array(productCategorySchema).optional().default([]),
});

// Schema for updating an existing product
export const updateProductSchema = productSchema.partial().extend({
  id: z.string().uuid(),
});

// Schema for querying products
export const getProductsSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().optional().default(10),
  sortBy: z
    .enum(['name', 'price', 'createdAt'])
    .optional()
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  categoryId: z.string().uuid().optional(),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().positive().optional(),
  search: z.string().optional(),
});

// Type definitions for TypeScript
export type ProductPhoto = z.infer<typeof productPhotoSchema>;
export type ProductCategory = z.infer<typeof productCategorySchema>;
export type Product = z.infer<typeof productSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;
export type GetProductsParams = z.infer<typeof getProductsSchema>;
