import axios from "axios";
import { useSession } from "next-auth/react";
import Cookies from "js-cookie";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// DTOs based on the provided models
export interface OrderProductDto {
  productSizeId: string;
  size: string;
  productName: string;
  productPrice: number;
  quantity: number;
  productPhotoUrl: string;
}

export interface OrderDto {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerAvatar: string;
  ownerEmail: string;
  totalPrice: number;
  shippingType: string;
  shippingCost: number;
  orderState: string;
  createdAt: string;
  products: OrderProductDto[];
  address: {
    receiverName: string;
    receiverEmail: string;
    detailAddress: string;
  };
}

export interface OrderParams {
  pageNumber?: number;
  pageSize?: number;
  shippingType?: string;
  orderState?: string;
  minPrice?: number;
  maxPrice?: number;
  orderBy?: string;
  sortBy?: "asc" | "desc";
}

export interface OrdersResponse {
  data: OrderDto[];
  totalItems: number;
  totalPages: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const useOrder = () => {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();

  // Get auth headers for authenticated requests
  const getAuthHeaders = () => {
    // Try to get token from cookie first, then fallback to session
    const tokenFromCookie = Cookies.get("access_token");
    const token = tokenFromCookie || session?.accessToken;

    if (!token) {
      console.warn("No authentication token found");
      return {};
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  };

  // Check if user is authenticated
  const isAuthenticated =
    status === "authenticated" || !!Cookies.get("access_token");

  // Fetch orders with optional filtering
  const fetchOrders = async (params?: OrderParams) => {
    if (!isAuthenticated) return null;

    try {
      const queryParams = new URLSearchParams();

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }

      const response = await axios.get(
        `${API_URL}/api/orders?${queryParams.toString()}`,
        { headers: getAuthHeaders() }
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching orders:", error);
      return null;
    }
  };

  // Get orders with react-query
  const useOrders = (params?: OrderParams) => {
    return useQuery({
      queryKey: ["orders", params],
      queryFn: () => fetchOrders(params),
      enabled: isAuthenticated,
      staleTime: 1000 * 60 * 5,
    });
  };

  // Get order by ID
  const fetchOrderById = async (id: string) => {
    if (!isAuthenticated) return null;

    try {
      const response = await axios.get(`${API_URL}/api/orders/${id}`, {
        headers: getAuthHeaders(),
      });

      return response.data;
    } catch (error) {
      console.error(`Error fetching order ${id}:`, error);
      return null;
    }
  };

  // Get order by ID with react-query
  const useOrderById = (id: string) => {
    return useQuery({
      queryKey: ["order", id],
      queryFn: () => fetchOrderById(id),
      enabled: !!id && isAuthenticated,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };

  const onCreateOrder = async ({
    shippingType,
    cartItemIds,
    receiverEmail,
    receiverName,
    detailAddress,
  }: {
    cartItemIds: string[];
    shippingType: string;
    receiverName: string;
    receiverEmail: string;
    detailAddress: string;
  }) => {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/orders`,
      {
        shippingType,
        cartItemIds,
        receiverEmail,
        receiverName,
        detailAddress,
      },
      {
        headers: {
          ...getAuthHeaders(),
        },
      }
    );

    return res.data;
  };

  return {
    onCreateOrder,
    useOrders,
    useOrderById,
    fetchOrders,
    fetchOrderById,
  };
};

export default useOrder;
