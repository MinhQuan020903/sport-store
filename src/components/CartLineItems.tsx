"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cn, currencyFormat } from "@/lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useCart } from "@/hooks/useCart";
import { Minus, PlusIcon, TrashIcon } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { useProductSize } from "@/hooks/useProductSize";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function CartLineItems({
  items,
  checkedItems,
  setCheckedItems,
  enableCheck = true,
}) {
  if (!items?.length) return null;

  return (
    <div className="flex flex-col pr-6">
      {items.map((item) => (
        <CartItem
          key={`${item.id}`}
          item={item}
          isChecked={Boolean(checkedItems[item.id])}
          onCheck={(itemKey, isChecked, item, quantity) => {
            if (isChecked) {
              setCheckedItems((prev) => ({ ...prev, [itemKey]: item }));
            } else {
              setCheckedItems((prev) => {
                const newCheckedItems = { ...prev };
                delete newCheckedItems[itemKey];
                return newCheckedItems;
              });
            }
          }}
          enableCheck={enableCheck}
        />
      ))}
    </div>
  );
}

const CartItem = ({ item, isChecked, onCheck, enableCheck }) => {
  const {
    onUpdateCart,
    onDeleteItemFromCart,
    onIncreaseItemFromCart,
    onDecreaseItemFromCart,
  } = useCart();
  const { fetchProductSizeById } = useProductSize();
  const queryClient = useQueryClient();

  // Track local quantity state
  const [quantity, setQuantity] = useState(item.quantity);
  // Loading state for operations
  const [isLoading, setIsLoading] = useState(false);
  // State to store size info
  const [sizeInfo, setSizeInfo] = useState(null);

  // Generate a unique key for this cart item
  const itemKey = item.id;

  // Fetch size info using productSizeId
  const { data: productSize, isLoading: isSizeLoading } = useQuery({
    queryKey: ["productSize", item.productSizeId],
    queryFn: async () => {
      try {
        // Use the fetchProductSizeById function from the hook
        return await fetchProductSizeById(item.productSizeId);
      } catch (error) {
        console.error("Error fetching product size:", error);
        return null;
      }
    },
    enabled: !!item.productSizeId,
  });

  useEffect(() => {
    if (productSize) {
      setSizeInfo(productSize);
    }
  }, [productSize]);

  // Update local quantity when item changes
  useEffect(() => {
    setQuantity(item.quantity);
  }, [item.quantity]);

  const handleIncreaseItemQuantity = async () => {
    try {
      setIsLoading(true);

      // For API-based cart (authenticated users)
      if (item.id) {
        await onIncreaseItemFromCart({
          data: {
            id: item.id,
          },
          selectedSize: item.selectedSize,
        });
      }
      // For Redux-based cart (unauthenticated users)
      else if (item.data) {
        onIncreaseItemFromCart({
          data: item.data,
          selectedSize: item.selectedSize,
        });
      }

      // If item was checked, update it in checkedItems with new quantity
      if (isChecked) {
        const updatedItem = { ...item, quantity: item.quantity + 1 };
        onCheck(itemKey, true, updatedItem, updatedItem.quantity);
      }

      queryClient.invalidateQueries(["useCart"]);
      setIsLoading(false);
    } catch (error) {
      console.error("Error increasing item quantity:", error);
      setIsLoading(false);
    }
  };

  const handleDecreaseItemQuantity = async () => {
    try {
      setIsLoading(true);
      const newQuantity = Math.max(1, item.quantity - 1);

      // For API-based cart (authenticated users)
      if (item.id) {
        await onDecreaseItemFromCart({
          data: {
            id: item.id,
          },
          selectedSize: item.selectedSize,
        });
      }
      // For Redux-based cart (unauthenticated users)
      else if (item.data) {
        onDecreaseItemFromCart({
          data: item.data,
          selectedSize: item.selectedSize,
        });
      }

      // Update checked items if still checked
      if (isChecked) {
        const updatedItem = { ...item, quantity: newQuantity };
        onCheck(itemKey, true, updatedItem, newQuantity);
      }

      queryClient.invalidateQueries(["useCart"]);
      setIsLoading(false);
    } catch (error) {
      console.error("Error decreasing item quantity:", error);
      setIsLoading(false);
    }
  };

  const handleUpdateQuantity = async (newQuantity) => {
    try {
      setIsLoading(true);

      // Only update if the quantity is different
      if (newQuantity !== item.quantity) {
        // For API-based cart (authenticated users)
        if (item.id) {
          await onUpdateCart({
            data: {
              id: item.id,
            },
            selectedSize: item.selectedSize,
            quantity: newQuantity,
          });
        }

        // Update checked items if checked
        if (isChecked) {
          const updatedItem = { ...item, quantity: newQuantity };
          onCheck(itemKey, true, updatedItem, newQuantity);
        }

        queryClient.invalidateQueries(["useCart"]);
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error updating item quantity:", error);
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async () => {
    try {
      setIsLoading(true);

      // For API-based cart (authenticated users)
      if (item.id) {
        await onDeleteItemFromCart({
          data: {
            id: item.id,
          },
          selectedSize: item.selectedSize,
          quantity: item.quantity,
        });
      }
      // For Redux-based cart (unauthenticated users)
      else if (item.data) {
        onDeleteItemFromCart({
          data: item.data,
          selectedSize: item.selectedSize,
          quantity: item.quantity,
        });
      }

      onCheck(itemKey, false, item, 0);
      queryClient.invalidateQueries(["useCart"]);
      setIsLoading(false);
    } catch (error) {
      console.error("Error deleting item:", error);
      setIsLoading(false);
    }
  };

  // Determine product information based on data structure
  const productName = item.productName || (item.data && item.data.name);
  const productPrice = item.productPrice || (item.data && item.data.price);
  const productImage =
    item.productPhotoUrl ||
    (item.data &&
      (item.data.mainPhotoUrl ||
        (typeof item.data.thumbnail === "object"
          ? item.data.thumbnail.url
          : item.data.thumbnail)));

  return (
    <div className="flex items-start justify-between gap-4 py-4">
      {enableCheck && (
        <div className="flex items-center h-full pt-2">
          <Checkbox
            id={`item-${itemKey}`}
            checked={isChecked}
            onCheckedChange={(checked) =>
              onCheck(itemKey, checked, item, item.quantity)
            }
          />
        </div>
      )}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between w-full">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
            <Image
              src={productImage || "/placeholder-product.jpg"}
              alt={productName || "Product"}
              fill
              className="absolute object-cover"
              sizes="64px"
            />
          </div>
          <div className="flex flex-col items-center sm:items-start">
            <span className="line-clamp-1 text-md font-medium text-nowrap">
              {productName}
            </span>
            <div className="flex items-center gap-1">
              <div className="font-semibold">Size:</div>
              {isSizeLoading ? (
                <span className="text-xs italic">Loading...</span>
              ) : sizeInfo?.size ? (
                sizeInfo.size
              ) : (
                item.selectedSize || (
                  <span className="text-xs text-muted-foreground">Unknown</span>
                )
              )}
            </div>
            <span className="line-clamp-1 text-xs">
              {currencyFormat(productPrice)}
            </span>
          </div>
        </div>
        <div className="flex flex-row sm:flex-row gap-3 items-center">
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={handleDecreaseItemQuantity}
              disabled={isLoading || quantity <= 1}
            >
              <Minus className="h-3 w-3" aria-hidden="true" />
              <span className="sr-only">Remove one item</span>
            </Button>
            <Input
              type="number"
              min="1"
              className="h-8 w-14 rounded-md border text-center"
              value={quantity}
              disabled={isLoading}
              onChange={(e) => {
                const newQuantity = Number(e.target.value);
                if (newQuantity > 0) {
                  setQuantity(newQuantity);
                  handleUpdateQuantity(newQuantity);
                }
              }}
            />
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={handleIncreaseItemQuantity}
              disabled={isLoading}
            >
              <PlusIcon className="h-3 w-3" aria-hidden="true" />
              <span className="sr-only">Add one item</span>
            </Button>
          </div>
          <Tooltip.Provider delayDuration={200}>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={handleDeleteItem}
                  disabled={isLoading}
                >
                  <TrashIcon className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Remove item</span>
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content sideOffset={5}>
                <span>Remove</span>
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        </div>
      </div>
    </div>
  );
};
