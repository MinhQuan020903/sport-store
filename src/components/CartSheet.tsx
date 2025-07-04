'use client';

import Link from 'next/link';

import { cn } from '@/lib/utils';
// import { currencyFormat } from '@/lib/utils';

import { Badge } from './ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
// import { CartLineItems } from '@/components/checkout/cart-line-items';

import { useCart } from '@/hooks/useCart';
import { CommonSvg } from '@/assets/CommonSvg';
import { CartLineItems } from './CartLineItems';
import { useEffect, useState } from 'react';
// import { useQueryClient } from '@tanstack/react-query';

export function CartSheet() {
  const { cart } = useCart();
  const [itemCount, setItemCount] = useState(0);
  const [uniqueItemCount, setUniqueItemCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const [checkedItems, setCheckedItems] = useState({});

  useEffect(() => {
    console.log('CartSheet cart: ', cart);
    const updateCartSheet = async () => {
      // Count total quantity (sum of all item quantities)
      setItemCount(
        cart?.listItem.reduce((total, item) => total + item.quantity, 0) || 0
      );

      // Count unique product types (each product counts as 1 regardless of quantity)
      setUniqueItemCount(cart?.listItem.length || 0);

      setCartTotal(
        Object.keys(checkedItems).length > 0
          ? Object.values(checkedItems).reduce(
              (
                sum: number,
                item: { product: { price: number }; quantity: number }
              ) => sum + (item?.product.price * item?.quantity || 0),
              0
            )
          : 0
      );
    };

    updateCartSheet();
  }, [cart?.listItem, checkedItems]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          aria-label="Open cart"
          variant="outline"
          size="icon"
          className="relative"
        >
          {uniqueItemCount > 0 && (
            <Badge
              variant="secondary"
              className="absolute -right-2 -top-2 h-6 w-6 justify-center rounded-full p-2.5"
            >
              {uniqueItemCount}
            </Badge>
          )}
          {CommonSvg.cart({ className: 'h-4 w-4' })}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-1">
          <SheetTitle>
            Giỏ hàng {uniqueItemCount > 0 && `(${uniqueItemCount})`}
          </SheetTitle>
        </SheetHeader>
        <div className="pr-6">
          <Separator />
        </div>
        {uniqueItemCount > 0 ? (
          <>
            <div className="flex flex-1 flex-col gap-5 overflow-hidden">
              <CartLineItems
                items={cart?.listItem}
                checkedItems={checkedItems}
                setCheckedItems={setCheckedItems}
                enableCheck={false}
              />
            </div>
            <div className="grid gap-1.5 pr-6 text-sm">
              <Separator className="mt-2" />

              <SheetFooter className="mt-1.5">
                <SheetTrigger asChild>
                  <Link
                    aria-label="Xem giỏ hàng của bạn"
                    href="/cart"
                    className={buttonVariants({
                      size: 'sm',
                      className: 'w-full',
                    })}
                  >
                    Xem giỏ hàng của bạn
                  </Link>
                </SheetTrigger>
              </SheetFooter>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center space-y-1">
            {CommonSvg.cart({
              className: 'mb-4 h-16 w-16 text-muted-foreground',
            })}

            <div className="text-xl font-medium text-muted-foreground">
              Giỏ hàng của bạn đang trống
            </div>
            <SheetTrigger asChild>
              <Link
                aria-label="Add items to your cart to checkout"
                href="/products"
                className={cn(
                  buttonVariants({
                    variant: 'link',
                    size: 'sm',
                    className: 'text-sm text-muted-foreground',
                  })
                )}
              >
                Thêm sản phẩm vào giỏ hàng để thanh toán
              </Link>
            </SheetTrigger>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
