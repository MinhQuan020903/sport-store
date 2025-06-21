'use client';

import { CartLineItems } from '@/components/CartLineItems';
import { useCart } from '@/hooks/useCart';
import React, { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function LeftCart({ checkedItems, setCheckedItems }) {
  const { cart } = useCart();
  const [itemCount, setItemCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // Thêm trạng thái loading
  const cartLineItems = cart?.listItem;

  useEffect(() => {
    setItemCount(
      cart?.listItem.reduce((total, item) => total + item.quantity, 0)
    );
  }, [cart?.listItem]);

  useEffect(() => {
    if (cartLineItems?.length > 0) {
      setIsLoading(false);

      // Initialize checked items
      const initialCheckedItems = {};
      cartLineItems.forEach((item) => {
        const itemKey = item.id
          ? `${item.id}-${item.productName || ''}-${item.selectedSize || ''}`
          : `${item?.data?.id}-${item?.data?.name || ''}-${
              item?.selectedSize || ''
            }`;

        initialCheckedItems[itemKey] = item;
      });

      // Only set checked items if empty to avoid overriding user selections
      if (Object.keys(checkedItems).length === 0) {
        setCheckedItems(initialCheckedItems);
      }
    }
    console.log(
      '🚀 ~ file: LeftCart.tsx:55 ~ useEffect ~ isLoading:',
      isLoading
    );
  }, [cartLineItems]);

  return (
    <div>
      {/* <h2 className="text-lg font-semibold">Your Items ({itemCount})</h2> */}
      <div className="w-full">
        <span className="text-lg font-semibold">
          Giỏ hàng của bạn ({itemCount})
        </span>
        {isLoading ? (
          <Skeleton className="w-full h-[300px] rounded-lg" />
        ) : null}
      </div>
      {isLoading ? (
        <Skeleton className="h-50 w-50 rounded-full" /> // Hiển thị skeleton khi đang tải
      ) : (
        <CartLineItems
          items={cartLineItems}
          checkedItems={checkedItems}
          setCheckedItems={setCheckedItems}
        />
      )}
    </div>
  );
}

export default LeftCart;
