import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import usePayment, { EPaymentMethod } from "@/hooks/usePayment";
import { postRequest } from "@/lib/fetch";
import React, { useEffect, useState } from "react";

const MoMoCheckout = ({ orderId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [paymentUrl, setPaymentUrl] = useState("");

  const { onGetPaymentUrl } = usePayment();

  useEffect(() => {
    const getPaymentUrl = async () => {
      const res = await onGetPaymentUrl({
        paymentMethod: EPaymentMethod.MoMo,
        orderId: orderId,
      });
      setPaymentUrl(res.paymentUrl);
      setIsLoading(false);
    };
    getPaymentUrl();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-full flex">
        <Loader />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex">
      <Button
        onClick={() => {
          window.open(paymentUrl, "_blank");
        }}
      >
        Open MoMo
      </Button>
    </div>
  );
};

export default MoMoCheckout;
