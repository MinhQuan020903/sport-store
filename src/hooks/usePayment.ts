import axios from "axios";
import { useSession } from "next-auth/react";
import Cookies from "js-cookie";

export enum EPaymentMethod {
  VNPay = 0,
  MoMo = 1,
}

const usePayment = () => {
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

  const onGetPaymentUrl = async ({
    orderId,
    paymentMethod,
  }: {
    orderId: string;
    paymentMethod: EPaymentMethod;
  }) => {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/payment/create-payment`,
      {
        orderId,
        paymentMethod,
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
    onGetPaymentUrl,
  };
};

export default usePayment;
