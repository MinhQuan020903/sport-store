'use client';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { currencyFormat } from '@/lib/utils';
import React, { useState } from 'react';
import { IoMdHeartEmpty } from 'react-icons/io';
import { BsFillCheckCircleFill } from 'react-icons/bs';
import { FiMinus, FiPlus } from 'react-icons/fi';
import Image from 'next/image';
import { useCart } from '@/hooks/useCart';
import { useSelectedProduct } from '@/hooks/useSelectedProduct';

function ProductDetailRight({ data }) {
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showError, setShowError] = useState(false);
  const { cart, onAddToCart } = useCart();
  const { onSelectProduct } = useSelectedProduct();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    if (!selectedSize) {
      setShowError(true);
      document.getElementById('sizesGrid')?.scrollIntoView({
        block: 'center',
        behavior: 'smooth',
      });
      return;
    }

    setIsAdding(true);

    // Add product to cart with selected size and quantity
    onSelectProduct({
      data: {
        ...data,
        selectedSize,
        quantity,
      },
    });

    // Send the product to backend cart using useCart hook
    onAddToCart({
      data,
      selectedSize,
      quantity,
    });

    setIsAdding(false);
  };

  const increaseQuantity = () => {
    const selectedSizeObj = data.sizes.find((s) => s.size === selectedSize);
    if (selectedSizeObj && quantity < selectedSizeObj.quantity) {
      setQuantity((prev) => prev + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  return (
    <div className="flex-[1] py-3">
      {/* Product Title */}
      <div className="text-[34px] font-semibold mb-2 leading-tight">
        {data.name}
      </div>

      {/* Product Subtitle */}
      <div className="text-lg font-semibold mb-5">{data.description}</div>

      {/* Product Price */}
      <div className="text-lg font-semibold ">{currencyFormat(data.price)}</div>

      {/* Product size */}
      <div className="mb-10 mt-5">
        {/* Heading */}
        <div className="flex justify-between mb-2">
          <div className="text-md font-semibold">Chọn kích cỡ</div>
          <div className="text-md font-medium text-black/[0.5] cursor-pointer">
            Kích cỡ
          </div>
        </div>

        {/* Size start */}
        <div id="sizesGrid" className="grid grid-cols-3 gap-2">
          {data.sizes?.map((size, index) => (
            <div
              onClick={
                size.quantity > 0
                  ? () => {
                      setSelectedSize(size.size);
                      setShowError(false);
                      setQuantity(1); // Reset quantity when changing size
                    }
                  : () => {}
              }
              key={index}
              className={`border-2 rounded-md text-center py-2.5 font-medium
                hover:bg-slate-300 
                cursor-pointer ${
                  size.quantity > 0
                    ? 'hover:border-black cursor-pointer'
                    : 'cursor-not-allowed disabled bg-black/[0.1] opacity-50'
                } ${selectedSize === size.size ? 'border-black' : ''} `}
            >
              {size.size}
            </div>
          ))}
        </div>
        {/* Size end */}

        {/* Show error */}
        {showError && (
          <div className="text-red-600 mt-1">
            Vui lòng chọn kích cỡ sản phẩm
          </div>
        )}
      </div>

      {/* Quantity selector - only show when size is selected */}
      {selectedSize && (
        <div className="mb-5">
          <div className="text-md font-semibold mb-2">Số lượng</div>
          <div className="flex items-center gap-3">
            <button
              onClick={decreaseQuantity}
              className="w-8 h-8 flex items-center justify-center border rounded-full"
              disabled={quantity <= 1}
            >
              <FiMinus
                className={quantity <= 1 ? 'text-gray-300' : 'text-black'}
              />
            </button>
            <span className="text-lg font-medium">{quantity}</span>
            <button
              onClick={increaseQuantity}
              className="w-8 h-8 flex items-center justify-center border rounded-full"
              disabled={
                quantity >=
                (data.sizes.find((s) => s.size === selectedSize)?.quantity || 0)
              }
            >
              <FiPlus
                className={
                  quantity >=
                  (data.sizes.find((s) => s.size === selectedSize)?.quantity ||
                    0)
                    ? 'text-gray-300'
                    : 'text-black'
                }
              />
            </button>
            <span className="text-sm text-gray-500 ml-2">
              Còn{' '}
              {data.sizes.find((s) => s.size === selectedSize)?.quantity || 0}{' '}
              sản phẩm
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 w-full items-center justify-center">
        {/* Add to cart button */}
        <div className="w-full flex">
          <Sheet>
            <SheetTrigger className="w-full mx-0 flex items-center justify-center">
              <Button
                className="w-full py-4 rounded-full bg-black text-white text-lg
                  font-medium transition-transform active:scale-95 mb-3 hover:opacity-75"
                onClick={handleAddToCart}
                disabled={isAdding}
              >
                {isAdding ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
              </Button>
            </SheetTrigger>
            <SheetContent side={'topRight'} className="w-[400px]">
              <SheetHeader>
                <div className="flex flex-row gap-3 items-center">
                  <BsFillCheckCircleFill
                    className="text-green-500 mr-2"
                    size={20}
                  />
                  <SheetTitle>Đã thêm vào giỏ hàng!</SheetTitle>
                </div>
                <div className="flex flex-row gap-4 w-full">
                  <div className="relative aspect-square h-24 w-16 min-w-fit overflow-hidden rounded">
                    <Image
                      alt="add to cart"
                      src={data.mainPhotoUrl || '/assets/placeholder.png'}
                      sizes="(max-width: '768px') 100vw, (max-width: 1200px) 50vw, 33vw"
                      fill
                      className="absolute object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-black text-sm font-medium">
                      {data.name}
                    </span>
                    <span className="text-black text-sm font-normal">Giày</span>
                    <span className="text-black text-sm font-normal">
                      Size: {selectedSize}
                    </span>
                    <span className="text-black text-sm font-normal">
                      Số lượng: {quantity}
                    </span>
                    <span className="text-black text-sm font-medium">
                      {currencyFormat(data.price * quantity)}
                    </span>
                  </div>
                </div>
                <div className="flex-row flex w-full py-3 gap-2">
                  <Button variant={'outline'} className="w-full">
                    Xem giỏ hàng ({cart?.listItem?.length || 0})
                  </Button>
                  <Button className="w-full">Thanh toán</Button>
                </div>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </div>

        {/* Favorites button */}
        <div className="w-full flex">
          <Button
            variant={'outline'}
            className="w-full py-4 rounded-full border border-black
              text-lg font-medium transition-transform active:scale-95 flex items-center
              justify-center gap-2 hover:opacity-75 mb-10"
          >
            Yêu thích
            <IoMdHeartEmpty size={20} />
          </Button>
        </div>
      </div>

      <div>
        <div className="text-lg font-bold mb-5">Thông tin chi tiết</div>
        <div className="markdown text-md mb-5">{data.description}</div>
      </div>
    </div>
  );
}

export default ProductDetailRight;
