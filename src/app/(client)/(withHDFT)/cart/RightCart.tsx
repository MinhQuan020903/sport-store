'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/useCart';
import { currencyFormat } from '@/lib/utils';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import CheckoutModal from './checkout/CheckoutModal';

function RightCart({ checkedItems }) {
  const { cart } = useCart();
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [shippingCost, setShippingCost] = useState(0);

  useEffect(() => {
    const randomShipping = Math.floor(Math.random() * 10) + 1;
    setShippingCost(randomShipping);
  }, []);

  useEffect(() => {
    const newTotal = Object.values(checkedItems)
      .filter((item) => item !== null) // Lọc ra các mục đã được chọn
      .reduce(
        (sum: number, item: any) => sum + item.productPrice * item.quantity,
        0
      );
    setTotal(newTotal);
  }, [checkedItems]);

  // Calculate the VAT (10% of subtotal)
  const vat = total * 0.1;

  // Calculate final total including shipping and VAT
  const finalTotal = total + shippingCost + vat;

  return (
    <div className="sticky bottom-0 lg:top-[100px] z-20 bg-white lg:bg-transparent">
      <h2 className="text-lg font-semibold">Tổng kết</h2>
      <div className="grid gap-1.5 lg:gap-4 pr-6 text-sm ">
        <Separator className="mb-2" />
        <div className="flex">
          <span className="flex-1">Tạm tính</span>
          <span>{currencyFormat(total)}</span>
        </div>
        <div className="flex">
          <span className="flex-1">Giao hàng</span>
          <span>{currencyFormat(shippingCost)}</span>
        </div>
        <div className="flex">
          <span className="flex-1">VAT (10%)</span>
          <span>{currencyFormat(vat)}</span>
        </div>
        <Separator className="mt-2" />
        <div className="flex">
          <span className="flex-1">Tổng tiền</span>
          <span>{currencyFormat(finalTotal)}</span>
        </div>
        <div>
          <Button
            className="w-full h-full"
            disabled={total === 0 || !Object.values(checkedItems).length}
            onClick={() => {
              setIsModalOpen(true);
            }}
          >
            Thanh toán
          </Button>

          {isModalOpen && (
            <div>
              <CheckoutModal
                checkedItems={checkedItems}
                total={finalTotal}
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RightCart;
