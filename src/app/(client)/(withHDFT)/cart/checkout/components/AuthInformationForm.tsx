"use client";

import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useOrder from "@/hooks/useOrder";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { AddressForm } from "./AddressForm";

const AuthInformationForm = ({
  setPage,
  user,
  setUserFullname,
  setUserAddress,
  setUserEmail,
  email,
  fullName,
  checkedItems,
  setOrderId,
  userAddress,
}) => {
  const { onCreateOrder } = useOrder();

  const handleAddressComplete = async (newAddress: string) => {
    setUserAddress(newAddress);

    try {
      if (!newAddress) {
        toast.error("Vui lòng thêm địa chỉ giao hàng");
        return;
      }

      var res = await onCreateOrder({
        shippingType: "default",
        cartItemIds: Object.keys(checkedItems),
        receiverName: fullName,
        receiverEmail: email,
        detailAddress: newAddress,
      });

      setOrderId(res.id);
      setPage("2");
    } catch (error) {
      toast.error("Có lỗi xảy ra.");
    }
  };

  return user ? (
    <div className="flex flex-col h-full justify-between">
      <div className="w-full h-full flex flex-col gap-y-6">
        <Input
          placeholder="Nhập đầy đủ họ tên"
          value={fullName}
          onChange={(e) => {
            setUserFullname(e.target.value);
          }}
          label="Họ Tên"
        />
        <Input
          placeholder="Nhập email"
          value={email}
          onChange={(e) => {
            setUserEmail(e.target.value);
          }}
          label="Email"
        />

        <div className="w-full flex flex-col">
          <Label>Địa chỉ</Label>

          <div className="w-full flex flex-col mt-2">
            <div className="flex justify-between mb-2">
              <h3 className="font-semibold">
                {userAddress ? "Cập nhật địa chỉ" : "Thêm địa chỉ"}
              </h3>
            </div>
            <AddressForm
              onComplete={handleAddressComplete}
              enable={!!fullName || !!email}
            />
          </div>
        </div>
      </div>
      {/* <div className="mt-20 w-full flex justify-center">
        <Button
          className="w-full"
          disabled={!fullName || !email || !addressValue}
          onClick={async () => {
            try {
              if (!addressValue) {
                toast.error("Vui lòng thêm địa chỉ giao hàng");
                return;
              }

              // var res = await onCreateOrder({
              //   shippingType: 'default',
              //   cartItemIds: Object.keys(checkedItems),
              // });

              // setOrderId(res.id);
              setPage("2");
            } catch (error) {
              toast.error("Có lỗi xảy ra.");
            }
          }}
        >
          Tiếp tục
        </Button>
      </div> */}
    </div>
  ) : (
    <div className="flex items-center justify-center">
      <Loader />
    </div>
  );
};

export default AuthInformationForm;
