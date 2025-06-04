'use client';

import Image from 'next/image';
import { Slot } from '@radix-ui/react-slot';
import { cn, currencyFormat, parseJSON } from '@/lib/utils';
import { Button } from './ui/button';
import { Icons } from '@/assets/Icons';
import { ScrollArea } from './ui/scroll-area';
import { CommonSvg } from '@/assets/CommonSvg';
import { Input } from './ui/input';
import { useCart } from '@/hooks/useCart';
import { useProduct } from '@/hooks/useProduct';
import { useEffect, useRef, useState } from 'react';
import { Skeleton, Spinner } from '@nextui-org/react';
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useIntersection } from '@mantine/hooks';
import { useDebouncedCallback } from 'use-debounce';
import toast from 'react-hot-toast';
import { CartItem as CartItemType } from '@/types';

interface CartLineItemsProps extends React.HTMLAttributes<HTMLDivElement> {
  items: CartItemType[];
  isScrollable?: boolean;
  isEditable?: boolean;
  variant?: 'default' | 'minimal';
  checkedItems: { [key: string]: any };
  setCheckedItems: React.Dispatch<React.SetStateAction<{ [key: string]: any }>>;
  enableCheck?: boolean;
}

const CartItem = ({ item, isChecked, onCheck, enableCheck }) => {
  const {
    onUpdateCart,
    onDeleteItemFromCart,
    onIncreaseItemFromCart,
    onDecreaseItemFromCart,
  } = useCart();

  const { onGetProductById } = useProduct();
  const queryClient = useQueryClient();

  // Track local quantity state
  const [quantity, setQuantity] = useState(item.quantity);
  // Loading state for operations
  const [isLoading, setIsLoading] = useState(false);
  // State to store full product details
  const [productDetails, setProductDetails] = useState<Product | null>(null);

  // Generate a unique key for this cart item - handles both API and Redux formats
  const itemKey = item.productId
    ? `${item.productId}-${item.productName || ''}-${item.selectedSize || ''}`
    : `${item?.data?.id}-${item?.data?.name || ''}-${item?.selectedSize || ''}`;

  // Fetch product details if we only have the productId
  const { data: fetchedProduct, isLoading: isProductLoading } = useQuery({
    queryKey: ['product', item.productId || item?.data?.id],
    queryFn: async () => {
      // If we have a product with details already, don't fetch
      if (item.product || item?.data) return null;

      const response = await onGetProductById(item.productId || item?.data?.id);
      return response?.data;
    },
    enabled:
      !!(item.productId || item?.data?.id) && !(item.product || item?.data),
  });

  useEffect(() => {
    if (fetchedProduct) {
      setProductDetails(fetchedProduct);
    }
  }, [fetchedProduct]);

  // Debounce the update cart function
  const debouncedOnUpdateCart = useDebouncedCallback(
    (data, selectedSize, quantity) => {
      onUpdateCart({ data, selectedSize, quantity });
      queryClient.refetchQueries(['useCart']);
    },
    500
  );

  // Fetch product size quantity
  const fetchProductSizeQuantity = async () => {
    const productId = item.productId || item?.data?.id;
    const selectedSize = item.selectedSize || item?.selectedSize;

    if (!productId || !selectedSize) return null;

    try {
      const response = await fetch(
        `/api/product/quantity?productId=${productId}&selectedSize=${selectedSize}`
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching product size quantity:', error);
      return null;
    }
  };

  // Query for product size quantity
  const { data: productSizeQuantity } = useQuery({
    queryKey: [
      'ProductSizeQuantity',
      item.productId || item?.data?.id,
      item.selectedSize || item?.selectedSize,
    ],
    queryFn: fetchProductSizeQuantity,
    enabled:
      !!(item.productId || item?.data?.id) &&
      !!(item.selectedSize || item?.selectedSize),
  });

  // Handlers for quantity changes
  const handleIncreaseItemQuantity = async () => {
    try {
      setIsLoading(true);
      const newQuantity = quantity + 1;

      // Check if increasing would exceed available stock
      if (
        productSizeQuantity &&
        newQuantity > productSizeQuantity[0]?.quantity
      ) {
        setIsLoading(false);
        return;
      }

      setQuantity(newQuantity);

      if (item.productId) {
        // Using API format for authenticated users
        await onIncreaseItemFromCart({
          data: {
            id: item.productId,
            name: item.productName || productDetails?.name,
            price: item.productPrice || productDetails?.price,
            mainPhotoUrl: item.productPhotoUrl || productDetails?.mainPhotoUrl,
          },
          selectedSize: item.selectedSize,
        });

        // Update checked items if needed
        if (isChecked) {
          const updatedItem = { ...item, quantity: newQuantity };
          onCheck(itemKey, true, updatedItem, newQuantity);
        }

        // Force refresh cart data
        queryClient.invalidateQueries(['useCart']);
      } else {
        // Using redux format for unauthenticated users
        onIncreaseItemFromCart({
          data: item?.data,
          selectedSize: item?.selectedSize,
        });

        // Update checked items if needed
        if (isChecked) {
          const updatedItem = { ...item, quantity: newQuantity };
          onCheck(itemKey, true, updatedItem, newQuantity);
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error increasing item quantity:', error);
      setIsLoading(false);
    }
  };

  const handleDecreaseItemQuantity = async () => {
    try {
      setIsLoading(true);
      if (quantity <= 1) {
        // If quantity would become 0, ask for confirmation to remove
        if (confirm('Remove item from cart?')) {
          await handleDeleteItem();
        }
        setIsLoading(false);
        return;
      }

      const newQuantity = quantity - 1;
      setQuantity(newQuantity);

      if (item.productId) {
        // Using API format for authenticated users
        await onDecreaseItemFromCart({
          data: {
            id: item.productId,
            name: item.productName || productDetails?.name,
            price: item.productPrice || productDetails?.price,
            mainPhotoUrl: item.productPhotoUrl || productDetails?.mainPhotoUrl,
          },
          selectedSize: item.selectedSize,
        });

        // Update checked items if still checked
        if (isChecked) {
          const updatedItem = { ...item, quantity: newQuantity };
          onCheck(itemKey, true, updatedItem, newQuantity);
        }

        // Force refresh cart data
        queryClient.invalidateQueries(['useCart']);
      } else {
        // Using redux format for unauthenticated users
        onDecreaseItemFromCart({
          data: item?.data,
          selectedSize: item?.selectedSize,
        });

        // Update checked items if still checked
        if (isChecked) {
          const updatedItem = { ...item, quantity: newQuantity };
          onCheck(itemKey, true, updatedItem, newQuantity);
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error decreasing item quantity:', error);
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async () => {
    try {
      setIsLoading(true);

      if (item.productId) {
        // Using API format
        await onDeleteItemFromCart({
          data: {
            id: item.productId,
            name: item.productName || productDetails?.name,
            price: item.productPrice || productDetails?.price,
            mainPhotoUrl: item.productPhotoUrl || productDetails?.mainPhotoUrl,
          },
          selectedSize: item.selectedSize,
          quantity: item.quantity,
        });
      } else {
        // Using redux format
        await onDeleteItemFromCart({
          data: item?.data,
          selectedSize: item?.selectedSize,
          quantity: item?.quantity,
        });
      }

      onCheck(itemKey, false, item, 0); // Remove item from checkedItems
      queryClient.refetchQueries(['useCart']);
      setIsLoading(false);
    } catch (error) {
      console.error('Error deleting item:', error);
      setIsLoading(false);
      return Promise.reject(error);
    }
  };

  // Update local quantity when item changes
  useEffect(() => {
    setQuantity(item.quantity);
  }, [item.quantity]);

  // Determine the product name, price, image to display
  const productName =
    item.productName || item?.data?.name || productDetails?.name;
  const productPrice =
    item.productPrice || item?.data?.price || productDetails?.price;
  const productImage =
    item.productPhotoUrl ||
    (typeof item?.data?.thumbnail === 'object'
      ? item?.data?.thumbnail?.url
      : item?.data?.thumbnail) ||
    item?.data?.mainPhotoUrl ||
    productDetails?.mainPhotoUrl;
  const selectedSize = item.selectedSize || item?.selectedSize;
  const productCategory = productDetails?.categories?.[0]?.name || 'Product';

  return (
    <div className="flex py-5 gap-3 md:gap-5 border-b">
      {/* Product Image */}
      <div
        className={`shrink-0 aspect-square w-[120px] ${
          productSizeQuantity && quantity > productSizeQuantity[0]?.quantity
            ? 'blur-sm'
            : ''
        }`}
      >
        {isLoading || isProductLoading ? (
          <Skeleton className="h-full w-full rounded-lg" />
        ) : (
          <div className="flex flex-row space-x-2 items-center justify-center">
            {enableCheck === false ? null : (
              <Input
                width={30}
                height={30}
                type="checkbox"
                disabled={
                  productSizeQuantity &&
                  quantity > productSizeQuantity[0]?.quantity
                }
                checked={isChecked}
                onChange={(e) =>
                  onCheck(itemKey, e.target.checked, item, quantity)
                }
              />
            )}

            <Image
              src={productImage || '/assets/placeholder.png'}
              alt={productName || 'Product'}
              width={90}
              height={80}
            />
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="w-full flex flex-col">
        {isLoading || isProductLoading ? (
          <Skeleton className="h-full w-full rounded-t-lg" />
        ) : (
          <div className="flex flex-col justify-between">
            <div className="text-sm md:text-lg font-semibold text-black/[0.8]">
              {productName}
            </div>
            <div className="text-sm md:text-md font-medium text-black/[0.5] block">
              {productCategory}
            </div>
            <div className="text-sm md:text-md font-bold text-black/[0.5] mt-2">
              {currencyFormat(productPrice || 0)}
            </div>
          </div>
        )}

        {/* Product Controls */}
        {isLoading || isProductLoading ? (
          <Skeleton className="h-full w-full rounded-b-lg" />
        ) : (
          <div className="flex flex-row flex-wrap justify-between mt-4 gap-2 text-black/[0.5] text-sm md:text-md">
            <div className="flex items-center gap-1 flex-wrap md:mt-0 mt-4">
              <div className="font-semibold">Size:</div>
              {selectedSize}
            </div>
            <div className="flex items-center justify-center gap-1 md:flex-row flex-col">
              <div className="font-semibold">Quantity:</div>

              <div className="flex items-center justify-center">
                {/* Decrease button */}
                <Button
                  id={`${item.productId || item?.data?.id}-decrement`}
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-r-none"
                  onClick={handleDecreaseItemQuantity}
                  disabled={isLoading || quantity <= 1}
                >
                  {isLoading ? (
                    <Spinner size="sm" />
                  ) : (
                    CommonSvg.subtract({ className: 'h-3 w-3' })
                  )}
                </Button>

                {/* Quantity display */}
                <div>
                  <Input
                    id={`${item.productId || item?.data?.id}-quantity`}
                    type="text"
                    min="0"
                    className="h-8 w-11 rounded-none border-x-0 text-black text-sm mb-3"
                    value={quantity}
                    disabled
                  />
                </div>

                {/* Increase button */}
                <Button
                  id={`${item.productId || item?.data?.id}-increment`}
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-l-none"
                  onClick={handleIncreaseItemQuantity}
                  disabled={
                    isLoading ||
                    (productSizeQuantity &&
                      quantity >= productSizeQuantity[0]?.quantity)
                  }
                >
                  {isLoading ? (
                    <Spinner size="sm" />
                  ) : (
                    CommonSvg.add({ className: 'h-3 w-3' })
                  )}
                  <span className="sr-only">Add one item</span>
                </Button>
              </div>
            </div>

            {/* Delete button */}
            <Button
              onClick={handleDeleteItem}
              size={'sm'}
              variant={'outline'}
              className="md:mt-2 mt-8"
              disabled={isLoading}
            >
              {isLoading ? (
                <Spinner size="sm" />
              ) : (
                <Icons.trash className="h-4 w-4 text-primary" />
              )}
            </Button>
          </div>
        )}

        {/* Out of stock warning */}
        {productSizeQuantity && quantity > productSizeQuantity[0]?.quantity ? (
          <div className="font-medium text-red-500 mt-2">
            You've selected more than the available quantity. Please reduce the
            quantity.
          </div>
        ) : null}
      </div>
    </div>
  );
};

export function CartLineItems({
  items,
  isScrollable = true,
  className,
  enableCheck,
  checkedItems,
  setCheckedItems,
  ...props
}: CartLineItemsProps) {
  const Wrapper = isScrollable ? ScrollArea : Slot;

  // Select all checkbox state
  const [allSelected, setAllSelected] = useState(false);

  const areAllItemsChecked = () => {
    return items?.every((item) => {
      const itemKey = item.productId
        ? `${item.productId}-${item.productName || ''}-${
            item.selectedSize || ''
          }`
        : `${item?.data?.id}-${item?.data?.name || ''}-${
            item?.selectedSize || ''
          }`;
      return !!checkedItems[itemKey];
    });
  };

  useEffect(() => {
    setAllSelected(areAllItemsChecked());
  }, [checkedItems]);

  const unselectAll = () => {
    setCheckedItems({});
    setAllSelected(false);
  };

  const checkAll = () => {
    const newCheckedItems = {};
    items.forEach((item) => {
      const itemKey = item.productId
        ? `${item.productId}-${item.productName || ''}-${
            item.selectedSize || ''
          }`
        : `${item?.data?.id}-${item?.data?.name || ''}-${
            item?.selectedSize || ''
          }`;
      newCheckedItems[itemKey] = item;
    });
    setCheckedItems(newCheckedItems);
    setAllSelected(true);
  };

  // Handle checkbox changes
  const handleCheck = (id, isChecked, item, uiQuantity) => {
    setCheckedItems((prevState) => {
      if (isChecked) {
        // Create a copy of the item with updated quantity
        const updatedItem = { ...item, quantity: uiQuantity };
        return { ...prevState, [id]: updatedItem };
      } else {
        const newState = { ...prevState };
        delete newState[id];
        return newState;
      }
    });
  };

  // Setup for infinite scroll
  const fetchCartItem = async (page: number) => {
    await new Promise((resolve) => setTimeout(resolve, 500)); // Reduced timeout for better UX
    const start = (page - 1) * 3;
    return items.slice(start, start + 3);
  };

  const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery(
    ['cartQuery'],
    async ({ pageParam = 1 }) => {
      const response = await fetchCartItem(pageParam);
      return response;
    },
    {
      getNextPageParam: (_, pages) => {
        return pages.length + 1;
      },
      initialData: {
        pages: [items?.slice(0, 3)],
        pageParams: [1],
      },
    }
  );

  const lastCartRef = useRef<HTMLElement>(null);
  const { ref, entry } = useIntersection({
    root: lastCartRef.current,
    threshold: 0.5,
  });

  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage();
    }
  }, [entry]);

  const _items = data?.pages.flatMap((page) => page);

  return (
    <div className="h-full w-full">
      {enableCheck === false ? null : (
        <Button
          onClick={allSelected ? unselectAll : checkAll}
          className="mt-4 w-[120px] max-h-max cursor-pointer bg-black"
        >
          {allSelected ? 'Unselect All' : 'Select All'}
        </Button>
      )}

      <Wrapper className="h-full">
        <div
          className={cn(
            'flex w-full flex-col gap-5',
            isScrollable && 'pr-6',
            className
          )}
          {...props}
        >
          {_items?.map((item, i) => {
            const itemKey = item.productId
              ? `${item.productId}-${item.productName || ''}-${
                  item.selectedSize || ''
                }`
              : `${item?.data?.id}-${item?.data?.name || ''}-${
                  item?.selectedSize || ''
                }`;

            if (i === _items.length - 1) {
              return (
                <div ref={ref} key={itemKey}>
                  <CartItem
                    item={item}
                    isChecked={!!checkedItems[itemKey]}
                    onCheck={handleCheck}
                    enableCheck={enableCheck}
                  />
                </div>
              );
            }

            return (
              <div key={itemKey}>
                <CartItem
                  item={item}
                  isChecked={!!checkedItems[itemKey]}
                  onCheck={handleCheck}
                  enableCheck={enableCheck}
                />
              </div>
            );
          })}
        </div>

        {isFetchingNextPage && (
          <div className="flex justify-center py-4">
            <Spinner size="lg" />
          </div>
        )}
      </Wrapper>
    </div>
  );
}
