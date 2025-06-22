import axios from "axios";
import { useSession } from "next-auth/react";
import Cookies from "js-cookie";

const useOrder = () => {
  const { data: session } = useSession();

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

  const onCreateOrder = async ({
    shippingType,
    cartItemIds,
  }: {
    cartItemIds: string[];
    shippingType: string;
  }) => {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/orders`,
      {
        shippingType,
        cartItemIds,
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
  };
};

export default useOrder;
