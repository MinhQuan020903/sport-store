'use client';
import Image from 'next/image';
import Link from 'next/link';
import { currencyFormat } from '@/lib/utils';
import { useEffect, useState } from 'react';
import {
  AiOutlineHeart,
  AiFillHeart,
  AiOutlineShoppingCart,
} from 'react-icons/ai';
import { useCart } from '@/hooks/useCart';
import { useWishList } from '@/hooks/useWishList';
import { useSelectedProduct } from '@/hooks/useSelectedProduct';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  console.log('Rendering ProductCard for:', product);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isAddToCart, setIsAddToCart] = useState<boolean>(false);
  const [isShowDialog, setIsShowDialog] = useState<boolean>(false);

  const { cart } = useCart();
  const { onSelectProduct, onToggleDialog } = useSelectedProduct();
  const { wishList, onAddUserWishList, onRemoveUserWishList } = useWishList();

  // Check if product is in cart
  useEffect(() => {
    if (!cart?.listItem) return;

    const found = cart?.listItem?.find(
      (item) => item?.data?.id === product?.id
    );
    if (found) {
      setIsAddToCart(true);
    }
  }, [cart?.listItem, product?.id]);

  // Check if product is in wishlist
  useEffect(() => {
    if (!wishList) return;

    const isProductInWishList = wishList.some(
      (wishListProduct) => wishListProduct.id === product.id
    );
    setIsLiked(isProductInWishList);
  }, [wishList, product.id]);

  // Get main photo URL or first photo URL or fallback image
  const getProductImage = () => {
    if (product.mainPhotoUrl) return product.mainPhotoUrl;

    if (product.photos && product.photos.length > 0) {
      // Try to find main photo first
      const mainPhoto = product.photos.find((photo) => photo.isMain);
      if (mainPhoto) return mainPhoto.url;

      // Otherwise use the first photo
      return product.photos[0].url;
    }

    // Fallback to a placeholder image
    return '/placeholder-product.jpg';
  };

  // Calculate discount if needed (just an example)
  const calculateDiscount = () => {
    // This is just a placeholder - implement your own logic
    const discountPercentage = 0; // No discount by default
    return discountPercentage;
  };

  const discount = calculateDiscount();
  const originalPrice =
    discount > 0 ? product.price * (1 + discount / 100) : null;

  return (
    <div className="group rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="relative">
        <Link href={`/product/${product?.id}`}>
          <div className="aspect-square overflow-hidden">
            <Image
              src={getProductImage()}
              alt={product.name}
              width={400}
              height={400}
              className="object-cover w-full h-full transform duration-200 group-hover:scale-105"
              priority
            />
          </div>
        </Link>

        {/* Wishlist button */}
        <div
          onClick={() => {
            if (!isLiked) {
              onAddUserWishList(product);
            } else {
              onRemoveUserWishList(product);
            }
            setIsLiked(!isLiked);
          }}
          className="transform duration-200 hover:scale-105 absolute items-center justify-center cursor-pointer flex top-3 right-3 w-[30px] h-[30px] rounded-full bg-white shadow-sm"
        >
          {isLiked ? (
            <AiFillHeart className="text-red-400 w-5 h-5" />
          ) : (
            <AiOutlineHeart className="text-slate-600 w-5 h-5" />
          )}
        </div>

        {/* Add to cart button */}
        <div
          onClick={() => {
            setIsShowDialog(true);
            onSelectProduct({ data: product });
            onToggleDialog();
          }}
          className="transform duration-200 hover:scale-105 absolute items-center justify-center cursor-pointer flex left-3 top-3 w-[30px] h-[30px] rounded-full bg-white shadow-sm"
        >
          <AiOutlineShoppingCart className="text-slate-600 w-5 h-5" />
        </div>

        {/* Out of stock badge */}
        {product.inStock <= 0 && (
          <div className="absolute bottom-2 left-2">
            <Badge variant="destructive">Out of stock</Badge>
          </div>
        )}
      </div>

      <Link href={`/product/${product?.id}`}>
        <div className="text-start p-4 text-black/[0.9]">
          {/* Product name */}
          {product.name}
          <h2 className="text-lg font-medium truncate">{product.name}</h2>

          {/* Category badges */}
          {product?.categories && product?.categories?.length > 0 && (
            <div className="flex flex-wrap gap-1 my-1">
              {product?.categories?.map((category) => (
                <Badge key={category.id} variant="outline" className="text-xs">
                  {category.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Price section */}
          <div className="flex items-center justify-between mt-1">
            <div className="flex flex-wrap items-center">
              <p className="mr-2 text-sm font-semibold">
                {currencyFormat(product.price)}
              </p>
              {originalPrice && (
                <p className="text-sm font-medium line-through text-gray-500">
                  {currencyFormat(originalPrice)}
                </p>
              )}
            </div>

            {discount > 0 && (
              <p className="text-sm font-medium text-green-500">
                {discount}% off
              </p>
            )}
          </div>

          {/* Stock indicator */}
          <p className="text-xs text-gray-500 mt-1">
            {product.inStock > 0
              ? `${product.inStock} in stock`
              : 'Currently unavailable'}
          </p>
        </div>
      </Link>
    </div>
  );
}
