import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';
import { useSession } from 'next-auth/react';

// API base URL - should match your API configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// TypeScript interfaces matching backend DTOs
export interface ProductSizeDto {
  id: string;
  size: string;
  quantity: number;
  productId: string;
  productName: string;
  productPrice: number;
  productMainPhotoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductSizeDto {
  size: string;
  quantity: number;
  productId?: string;
}

export interface UpdateProductSizeDto {
  id: string;
  size: string;
  quantity: number;
}

export interface ProductSizeParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  productId?: string;
}

export const useProductSize = () => {
  const queryClient = useQueryClient();
  const { data: session, status } = useSession();

  const getAuthHeaders = () => {
    // Try to get token from cookie first, then fallback to session
    const tokenFromCookie = Cookies.get('access_token');
    const token = tokenFromCookie || session?.accessToken;

    if (!token) {
      console.warn('No authentication token found');
      return {};
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  };

  // Get all product sizes with pagination and filtering
  const useProductSizes = (params?: ProductSizeParams) => {
    return useQuery({
      queryKey: ['productSizes', params],
      queryFn: async () => {
        const queryParams = new URLSearchParams();

        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              queryParams.append(key, String(value));
            }
          });
        }

        const response = await axios.get(
          `${API_URL}/api/ProductSizes?${queryParams.toString()}`,
          { headers: getAuthHeaders() }
        );

        return response.data;
      },
      keepPreviousData: true,
    });
  };

  // Get a single product size by ID
  const useProductSizeById = (id: string) => {
    return useQuery({
      queryKey: ['productSize', id],
      queryFn: async () => {
        if (!id) return null;

        const response = await axios.get(`${API_URL}/api/ProductSizes/${id}`, {
          headers: getAuthHeaders(),
        });

        return response.data;
      },
      enabled: !!id,
    });
  };

  // Get product sizes by product ID
  const useProductSizesByProductId = (productId: string) => {
    return useQuery({
      queryKey: ['productSizes', 'product', productId],
      queryFn: async () => {
        if (!productId) return [];

        const response = await axios.get(
          `${API_URL}/api/ProductSizes/product/${productId}`,
          { headers: getAuthHeaders() }
        );

        return response.data;
      },
      enabled: !!productId,
    });
  };

  // Create a new product size
  const createProductSizeMutation = useMutation({
    mutationFn: async (productSizeDto: CreateProductSizeDto) => {
      const response = await axios.post(
        `${API_URL}/api/ProductSizes`,
        productSizeDto,
        {
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
        }
      );

      return response.data;
    },
    onSuccess: (data, variables) => {
      toast.success('Product size created successfully');

      // Invalidate related queries
      queryClient.invalidateQueries(['productSizes']);
      if (variables.productId) {
        queryClient.invalidateQueries([
          'productSizes',
          'product',
          variables.productId,
        ]);
      }
    },
    onError: (error) => {
      console.error('Error creating product size:', error);
      toast.error('Failed to create product size');
    },
  });

  // Update an existing product size
  const updateProductSizeMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateProductSizeDto;
    }) => {
      const response = await axios.put(
        `${API_URL}/api/ProductSizes/${id}`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
        }
      );

      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Product size updated successfully');

      // Invalidate related queries
      queryClient.invalidateQueries(['productSizes']);
      queryClient.invalidateQueries(['productSize', data.id]);
      if (data.productId) {
        queryClient.invalidateQueries([
          'productSizes',
          'product',
          data.productId,
        ]);
      }
    },
    onError: (error) => {
      console.error('Error updating product size:', error);
      toast.error('Failed to update product size');
    },
  });

  // Delete a product size
  const deleteProductSizeMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(`${API_URL}/api/ProductSizes/${id}`, {
        headers: getAuthHeaders(),
      });

      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Product size deleted successfully');

      // Invalidate related queries
      queryClient.invalidateQueries(['productSizes']);
      if (data.productId) {
        queryClient.invalidateQueries([
          'productSizes',
          'product',
          data.productId,
        ]);
      }
    },
    onError: (error) => {
      console.error('Error deleting product size:', error);
      toast.error('Failed to delete product size');
    },
  });

  // Function wrappers for easier use
  const onCreateProductSize = (productSizeDto: CreateProductSizeDto) => {
    return createProductSizeMutation.mutateAsync(productSizeDto);
  };

  const onUpdateProductSize = (
    id: string,
    productSizeDto: UpdateProductSizeDto
  ) => {
    return updateProductSizeMutation.mutateAsync({ id, data: productSizeDto });
  };

  const onDeleteProductSize = (id: string) => {
    return deleteProductSizeMutation.mutateAsync(id);
  };

  // Create a function to fetch a product size by ID directly
  const fetchProductSizeById = async (
    id: string
  ): Promise<ProductSizeDto | null> => {
    try {
      if (!id) return null;

      const response = await axios.get(`${API_URL}/api/ProductSizes/${id}`, {
        headers: getAuthHeaders(),
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching product size:', error);
      return null;
    }
  };

  return {
    // Query hooks
    useProductSizes,
    useProductSizeById,
    useProductSizesByProductId,

    // Mutation functions
    onCreateProductSize,
    onUpdateProductSize,
    onDeleteProductSize,

    // Direct fetch functions
    fetchProductSizeById,

    // Loading states
    isCreating: createProductSizeMutation.isLoading,
    isUpdating: updateProductSizeMutation.isLoading,
    isDeleting: deleteProductSizeMutation.isLoading,
  };
};
