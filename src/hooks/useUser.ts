import axios from "axios";
import { useSession } from "next-auth/react";
import Cookies from "js-cookie";

export const useUser = () => {
  const { data: session, status } = useSession();

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

  const onGetUserDetail = async (userId) => {
    const user = await axios.get(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/users?userId=${userId}`,
      {
        headers: {
          ...getAuthHeaders(),
        },
      }
    );
    // const data = await productDetail?.json();

    return user.data;
  };

  const onGetMe = async () => {
    const user = await axios.get(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/users/me`,
      {
        headers: {
          ...getAuthHeaders(),
        },
      }
    );
    // const data = await productDetail?.json();

    return user.data;
  };

  return { onGetUserDetail, onGetMe };
};
