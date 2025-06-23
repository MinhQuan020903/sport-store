"use client";

import React from "react";
import VnPayCheckout from "./childComponents/VnPayCheckout";
import MoMoCheckout from "./childComponents/MoMoCheckout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EPaymentMethod } from "@/hooks/usePayment";

const checkOutConst = [
  { value: EPaymentMethod.MoMo, label: "Momo" },
  { value: EPaymentMethod.VNPay, label: "VNPay" },
];

export const PaymentForm = ({ orderId }) => {
  const [selectedType, setSelectedType] = React.useState<string>("");

  return (
    <div className="w-full h-full px-1">
      <Select
        key={"province"}
        value={selectedType}
        onValueChange={setSelectedType}
      >
        <SelectTrigger className="w-[98%] mb-5">
          <SelectValue placeholder="Phương thức thanh toán" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px] overflow-y-scroll">
          {checkOutConst?.map((item) => (
            <SelectItem key={item.value} value={item.value.toString()}>
              {item.label.toString()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedType === EPaymentMethod.MoMo.toString() && (
        <MoMoCheckout orderId={orderId} />
      )}
      {selectedType === EPaymentMethod.VNPay.toString() && (
        <VnPayCheckout orderId={orderId} />
      )}
    </div>
  );
};
