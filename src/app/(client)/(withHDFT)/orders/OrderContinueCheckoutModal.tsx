"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import { Button } from "@/components/ui/button";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EPaymentMethod } from "@/hooks/usePayment";
import MoMoCheckout from "../cart/checkout/components/childComponents/MoMoCheckout";
import VnPayCheckout from "../cart/checkout/components/childComponents/VnPayCheckout";

interface OrderContinueCheckoutModalProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
}

const checkOutConst = [
  { value: EPaymentMethod.MoMo, label: "Momo" },
  { value: EPaymentMethod.VNPay, label: "VNPay" },
];

export default function OrderContinueCheckoutModal({
  orderId,
  isOpen,
  onClose,
}: OrderContinueCheckoutModalProps) {
  const [selectedType, setSelectedType] = React.useState<string>("");

  return (
    <Modal
      isOpen={isOpen}
      size="3xl"
      scrollBehavior="inside"
      classNames={{
        base: "py-3 px-4 border border-border bg-background shadow-lg",
        backdrop: "bg-background/80 backdrop-blur-sm",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Tiếp tục thanh toán</h3>
              <p className="text-sm text-muted-foreground">
                #{orderId.substring(0, 8)}
              </p>
            </div>
          </div>
        </ModalHeader>

        <ModalBody>
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
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
