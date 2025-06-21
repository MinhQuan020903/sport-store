'use client';

import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Cookies from 'js-cookie';

// Import redux actions
import {
  addToCart,
  increaseItemFromCart,
  decreaseItemFromCart,
  deleteItemFromCart,
  clearCart,
} from '@/redux/cart/cart';

import { CartItem } from '@/types';

// DTOs matching the backend
interface CreateCartItemDto {
  productSizeId: string;
  quantity: number;
}

interface UpdateCartItemDto {
  quantity: number;
}

interface Cart {
  userId: string;
  listItem: CartItem[];
}

const API_URL = process.env.NEXT_PUBLIC_API_HOST || '';

export const useCart = () => {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  const reduxCart = useSelector((state: any) => state.cart) || null;
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);

  // Get auth headers for authenticated requests - now using cookies directly
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

  // Check if user is authenticated
  const isAuthenticated =
    status === 'authenticated' || !!Cookies.get('access_token');

  // Fetch cart items from API
  const fetchUserCart = async () => {
    if (!isAuthenticated) return null;
    try {
      const response = await axios.get(`${API_URL}/api/CartItems`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching cart:', error);
      return null;
    }
  };

  const {
    data: userCart,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ['useCart'],
    queryFn: fetchUserCart,
    enabled: isAuthenticated,
  });

  // Convert API response to Redux format
  const convertToReduxCart = (apiCart) => {
    if (!apiCart) return null;

    const listItem = apiCart.map((item) => ({
      data: item.product,
      quantity: item.quantity,
      selectedSize: item.selectedSize,
    }));

    const total = listItem.reduce(
      (sum, item) => sum + item.data.price * item.quantity,
      0
    );

    return {
      error: null,
      loading: false,
      total,
      listItem,
    };
  };

  // Add to cart - matches POST /api/CartItems
  const addToCartMutationFn = async ({ selectedSizeId, quantity }) => {
    // Get the productSizeId based on the product ID and size

    const createCartItemDto: CreateCartItemDto = {
      productSizeId: selectedSizeId,
      quantity: quantity,
    };
    console.log('Adding to cart with DTO:', createCartItemDto);

    const response = await axios.post(
      `${API_URL}/api/CartItems`,
      createCartItemDto,
      {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      }
    );

    if (response.status !== 201) {
      throw new Error('Failed to add to cart');
    }

    return response.data;
  };

  const addToCartMutation = useMutation({
    mutationKey: ['onAddToCart'],
    mutationFn: addToCartMutationFn,
    onError: (error) => {
      console.error(error);
      toast.error('Failed to add item to cart');
    },
    onSettled: (data, error) => {
      if (error) {
        console.error('Mutation failed with error:', error);
      } else {
        toast.success('Item added to cart');
        queryClient.refetchQueries(['useCart']);
        queryClient.removeQueries(['cartQuery']);
      }
    },
  });

  const onAddToCart = ({ selectedSizeId, quantity }) => {
    if (isAuthenticated) {
      try {
        addToCartMutation.mutate({ selectedSizeId, quantity });
      } catch (error) {
        console.error(error);
      }
    } else {
      dispatch(addToCart({ selectedSizeId, quantity }));
    }
  };

  // Update cart - matches PUT /api/CartItems/{productId}
  const updateCartMutationFn = async ({ data, selectedSize, quantity }) => {
    const updateCartItemDto: UpdateCartItemDto = {
      quantity: quantity,
    };

    const response = await axios.put(
      `${API_URL}/api/CartItems/${data.id}`,
      updateCartItemDto,
      {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      }
    );

    if (response.status !== 200) {
      throw new Error('Failed to update cart');
    }

    return response.data;
  };

  const updateCartMutation = useMutation(updateCartMutationFn, {
    onError: (error) => {
      console.error(error);
      toast.error('Failed to update cart');
    },
    onSettled: (data, error) => {
      if (error) {
        console.error('Mutation failed with error:', error);
      } else {
        toast.success('Cart updated successfully');
        queryClient.refetchQueries(['useCart']);
      }
    },
  });

  const onUpdateCart = ({ data, selectedSize, quantity }) => {
    if (isAuthenticated) {
      updateCartMutation.mutate({ data, selectedSize, quantity });
    }
  };

  // Helper function to get productSizeId from product ID and size
  const getProductSizeId = async (productId, size) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/productSizes/sizes/${productId}`
      );
      return response.data.id;
    } catch (error) {
      console.error('Error fetching product size ID:', error);
      throw new Error('Failed to get product size ID');
    }
  };

  // Increase item in cart - uses the update endpoint
  const onIncreaseItemFromCart = useCallback(
    ({ data, selectedSize }) => {
      if (isAuthenticated) {
        try {
          // Get current quantity from cart
          const currentItem = userCart.find((item) => item.id === data.id);
          if (!currentItem) return;

          const currentQuantity = currentItem.quantity || 0;

          // Call the PUT API endpoint to update quantity
          updateCartMutation.mutate({
            data,
            selectedSize,
            quantity: currentQuantity + 1,
          });
        } catch (error) {
          console.error('Error increasing cart item:', error);
        }
      } else {
        dispatch(increaseItemFromCart({ data, selectedSize }));
      }
    },
    [isAuthenticated, dispatch, updateCartMutation, userCart]
  );

  // Decrease item in cart - uses the update endpoint
  const onDecreaseItemFromCart = useCallback(
    ({ data, selectedSize }) => {
      if (isAuthenticated) {
        try {
          // First get current quantity, then decrease it
          let currentItem;

          // Handle different cart item formats
          if (userCart) {
            // Find the item in the cart
            currentItem = userCart.find((item) => item.id === data.id);
          }

          const currentQuantity = currentItem?.quantity || 0;

          console.log('Decreasing item quantity:', {
            itemId: data.id,
            currentQuantity,
            newQuantity: Math.max(1, currentQuantity - 1), // Ensure quantity never goes below 1
          });

          // Only update if quantity is greater than 1
          if (currentQuantity > 1) {
            // Call the PUT API endpoint to update quantity
            updateCartMutation.mutate({
              data,
              selectedSize,
              quantity: currentQuantity - 1,
            });
          } else {
            // If quantity is already 1, don't do anything or show a message
            toast.info('Minimum quantity reached');
            // Refresh the cart to ensure consistent UI
            queryClient.invalidateQueries(['useCart']);
          }
        } catch (error) {
          console.error('Error decreasing cart item:', error);
        }
      } else {
        // For Redux cart, the reducer already handles the minimum quantity check
        dispatch(decreaseItemFromCart({ data, selectedSize }));
      }
    },
    [isAuthenticated, dispatch, updateCartMutation, userCart, queryClient]
  );

  // Delete item from cart - matches DELETE /api/CartItems/{productId}
  const deleteItemFromCartMutation = useMutation(
    async ({ data }) => {
      const response = await axios.delete(
        `${API_URL}/api/CartItems/${data.id}`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (response.status !== 200) {
        throw new Error('Failed to delete item from cart');
      }

      return response.data;
    },
    {
      onError: (error) => {
        console.error(error);
        toast.error('Failed to remove item from cart');
      },
    }
  );

  const onDeleteItemFromCart = ({
    data,
    selectedSize,
    quantity,
  }: {
    data: any;
    selectedSize: any;
    quantity: any;
  }) => {
    if (isAuthenticated) {
      deleteItemFromCartMutation.mutate(
        { data, selectedSize, quantity },
        {
          onSuccess: () => {
            toast.success('Item removed from cart');
            queryClient.refetchQueries(['useCart']);
            queryClient.removeQueries(['cartQuery']);
          },
          onError: (error) => {
            queryClient.refetchQueries(['useCart']);
            queryClient.removeQueries(['cartQuery']);
            console.log(error, 'Error delete item from cart mutation');
          },
        }
      );
    } else {
      dispatch(deleteItemFromCart({ data, selectedSize, quantity }));
    }
  };

  // Clear cart - matches DELETE /api/CartItems
  const clearCartMutation = useMutation(
    async () => {
      const response = await axios.delete(`${API_URL}/api/CartItems`, {
        headers: getAuthHeaders(),
      });

      if (response.status !== 200) {
        throw new Error('Failed to clear cart');
      }

      return response.data;
    },
    {
      onError: (error) => {
        console.error(error);
        toast.error('Failed to clear cart');
      },
      onSuccess: () => {
        toast.success('Cart cleared successfully');
        queryClient.refetchQueries(['useCart']);
        queryClient.removeQueries(['cartQuery']);
      },
    }
  );

  const onClearCart = () => {
    if (isAuthenticated) {
      clearCartMutation.mutate();
    } else {
      dispatch(clearCart());
    }
  };

  // For non-authenticated users, use the Redux store cart
  // For authenticated users, use the API cart data
  const userId = session?.user?.id || Cookies.get('userId');
  const currentCart = isAuthenticated
    ? { userId: userId || 'guest', listItem: userCart || [] }
    : reduxCart;

  return {
    onAddToCart,
    onIncreaseItemFromCart,
    onDecreaseItemFromCart,
    onDeleteItemFromCart,
    onClearCart,
    clearCart: clearCartMutation.mutate,
    updateCart: updateCartMutation.mutate,
    cart: currentCart,
    refetch,
    onUpdateCart,
    isAddingToCart: addToCartMutation.isLoading,
    successAdded: addToCartMutation.isSuccess,
    loading: isLoading || loading,
    isAuthenticated,
  };
};
