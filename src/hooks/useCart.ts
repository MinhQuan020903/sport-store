'use client';

import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// Import redux actions
import {
  addToCart,
  increaseItemFromCart,
  decreaseItemFromCart,
  deleteItemFromCart,
} from '@/redux/cart/cart';

// Replace with your external API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const useCart = () => {
  const { data: session } = useSession();
  const dispatch = useDispatch();
  const reduxCart = useSelector((state: any) => state.cart) || null;
  const queryClient = useQueryClient();

  // Modified to fetch from external API
  const fetchUserCart = async (userId) => {
    if (!userId) return null;
    try {
      const response = await axios.get(`${API_BASE_URL}/cart/${userId}`);
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
    queryFn: () => fetchUserCart(session?.user.id),
    enabled: !!session,
  });

  // Convert API response to Redux format
  const convertToReduxCart = (apiCart) => {
    // Adjust this conversion function based on your API response structure
    const listItem = apiCart.cartItems.map((item) => ({
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

  const cart = session
    ? isLoading
      ? null
      : userCart
      ? convertToReduxCart(userCart)
      : null
    : reduxCart;

  // Add to cart mutation
  const addToCartMutationFn = async ({ data, selectedSize, quantity }) => {
    const response = await axios.post(
      `${API_BASE_URL}/cart/${session?.user.id}`,
      {
        productId: data.id,
        selectedSize: selectedSize,
        quantity: quantity,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`, // Add if your API requires auth
        },
      }
    );

    if (response.status !== 200 && response.status !== 201) {
      throw new Error('Failed to add to cart');
    }

    if (response.status === 201) {
      toast.error(response.data.message);
    }

    return response.data;
  };

  const addToCartMutation = useMutation({
    mutationKey: ['onAddToCart'],
    mutationFn: addToCartMutationFn,
    onError: (error) => {
      console.error(error);
    },
    onSettled: (data, error) => {
      if (error) {
        console.error('Mutation failed with error:', error);
      } else {
        queryClient.refetchQueries(['useCart']);
        queryClient.removeQueries(['cartQuery']);
      }
    },
  });

  const onAddToCart = ({ data, selectedSize, quantity }) => {
    if (session) {
      try {
        addToCartMutation.mutate({ data, selectedSize, quantity });
      } catch (error) {
        console.error(error);
      }
    } else {
      dispatch(addToCart({ data, selectedSize, quantity }));
    }
  };

  // Update cart mutation
  const updateCartMutationFn = async ({ data, selectedSize, quantity }) => {
    const response = await axios.put(
      `${API_BASE_URL}/cart/${session?.user.id}`,
      {
        productId: data.id,
        selectedSize: selectedSize,
        quantity: quantity,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`, // Add if your API requires auth
        },
      }
    );

    if (response.status < 200 || response.status >= 300) {
      throw new Error('Failed to update cart');
    }

    if (response.status === 201) {
      toast.success(response.data.message);
    }

    return response.data;
  };

  const updateCartMutation = useMutation(updateCartMutationFn, {
    onError: (error) => {
      console.error(error);
    },
    onSettled: (data, error) => {
      if (error) {
        console.error('Mutation failed with error:', error);
      } else {
        queryClient.refetchQueries(['useCart']);
      }
    },
  });

  const onUpdateCart = ({ data, selectedSize, quantity }) => {
    if (session) {
      updateCartMutation.mutate({ data, selectedSize, quantity });
    }
  };

  // Increase item in cart
  const onIncreaseItemFromCart = useCallback(
    ({ data, selectedSize }) => {
      if (session) {
        try {
          addToCartMutation.mutate({ data, selectedSize, quantity: 1 });
        } catch (error) {
          console.error(error);
        }
      } else {
        dispatch(increaseItemFromCart({ data, selectedSize }));
      }
    },
    [session, dispatch, addToCartMutation]
  );

  // Decrease item in cart
  const onDecreaseItemFromCart = useCallback(
    ({ data, selectedSize }) => {
      if (session) {
        try {
          addToCartMutation.mutate({ data, selectedSize, quantity: -1 });
        } catch (error) {
          console.error(error);
        }
      } else {
        dispatch(decreaseItemFromCart({ data, selectedSize }));
      }
    },
    [session, dispatch, addToCartMutation]
  );

  // Delete item from cart
  const deleteItemFromCartMutation = useMutation<
    any,
    Error,
    { data: any; selectedSize: any; quantity: any }
  >(
    async ({ data, selectedSize, quantity }) => {
      const response = await axios.delete(
        `${API_BASE_URL}/cart/${session?.user.id}`,
        {
          data: {
            productId: data.id,
            selectedSize: selectedSize,
            quantity: quantity,
          },
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.accessToken}`, // Add if your API requires auth
          },
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
    if (session) {
      deleteItemFromCartMutation.mutate(
        { data, selectedSize, quantity },
        {
          onSuccess: () => {
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

  return {
    onAddToCart,
    onIncreaseItemFromCart,
    onDecreaseItemFromCart,
    onDeleteItemFromCart,
    cart,
    refetch,
    onUpdateCart,
    isAddingToCart: addToCartMutation.isLoading,
    successAdded: addToCartMutation.isSuccess,
  };
};
