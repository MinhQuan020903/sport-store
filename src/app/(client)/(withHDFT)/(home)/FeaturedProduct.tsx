'use client';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import ProductCard from '@/components/ProductCard';
import Loader from '@/components/Loader';
import { useProduct } from '@/hooks/useProduct';

function FeaturedProduct() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { onGetProducts } = useProduct();

  useEffect(() => {
    const getFeaturedProducts = async () => {
      try {
        setIsLoading(true);
        const response = await onGetProducts({
          page: 1,
          limit: 10,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        });

        // Handle both potential response formats
        if (Array.isArray(response)) {
          // Direct array response
          setFeaturedProducts(response);
        } else if (response?.data && Array.isArray(response.data)) {
          // Nested data property containing array
          setFeaturedProducts(response.data);
        } else if (response?.items && Array.isArray(response.items)) {
          // Paginated response with items array
          setFeaturedProducts(response.items);
        } else {
          console.warn('Unexpected response format:', response);
          setFeaturedProducts([]);
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
        setFeaturedProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    getFeaturedProducts();
  }, []);

  return (
    <section className="lg:px-10 px-5 py-10 mt-20 md:mt-30">
      <div className="mx-auto flex flex-col space-y-4 text-center">
        <section
          id="featured-products"
          aria-labelledby="featured-products-heading"
          className="space-y-6"
        >
          <div className="flex justify-between flex-wrap">
            <h2 className="text-2xl font-medium sm:text-3xl">
              Sản phẩm đang có sẵn
            </h2>
            <Link aria-label="Products" href="/products">
              <div
                className={cn(
                  buttonVariants({
                    size: 'sm',
                  })
                )}
              >
                Xem tất cả
              </div>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader />
            </div>
          ) : (
            <Swiper
              style={
                {
                  '--swiper-navigation-size': '44px',
                  '--swiper-navigation-top-offset': '40%',
                  '--swiper-navigation-sides-offset': '10px',
                  '--swiper-navigation-color': '#000000',
                  '--swiper-navigation-color-hover': '#000000',
                  '--swiper-button-next': '12px',
                } as React.CSSProperties
              }
              direction="horizontal"
              slidesPerView={1}
              spaceBetween={10}
              navigation={true}
              breakpoints={{
                700: {
                  slidesPerView: 1,
                  spaceBetween: 10,
                },
                900: {
                  slidesPerView: 2,
                  spaceBetween: 10,
                },
                1100: {
                  slidesPerView: 3,
                  spaceBetween: 20,
                },
                1300: {
                  slidesPerView: 4,
                  spaceBetween: 10,
                },
              }}
              modules={[Navigation]}
              className="w-full h-auto overflow-visible relative"
            >
              {featuredProducts.length > 0 ? (
                featuredProducts.map((product, index) => (
                  <SwiperSlide key={index} virtualIndex={index}>
                    <ProductCard product={product} />
                  </SwiperSlide>
                ))
              ) : (
                <div className="py-12 text-center w-full">
                  <p>No products available</p>
                </div>
              )}
            </Swiper>
          )}
        </section>
      </div>
    </section>
  );
}

export default FeaturedProduct;
