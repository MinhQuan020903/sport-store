'use client';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import React, { useEffect, useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import { BiArrowBack } from 'react-icons/bi';

function ProductDetailLeft({ data }) {
  const [isClient, setIsClient] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // This ensures the Carousel only renders on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !data) {
    // Return a placeholder or loading state until client-side rendering is ready
    return (
      <div className="text-white text-[20px] w-full max-w-[1360px] sticky top-[50px]">
        <div className="aspect-square bg-gray-200 animate-pulse"></div>
      </div>
    );
  }

  // Check if we have photos to display
  const hasPhotos = Array.isArray(data.photos) && data.photos.length > 0;
  const images = hasPhotos
    ? data.photos.map((photo) => photo.url)
    : data.mainPhotoUrl
    ? [data.mainPhotoUrl]
    : [];

  // If no images are available, show a placeholder
  if (images.length === 0) {
    return (
      <div className="text-white text-[20px] w-full max-w-[1360px] sticky top-[50px]">
        <div className="aspect-square bg-gray-200 flex items-center justify-center">
          <span>No images available</span>
        </div>
      </div>
    );
  }

  // Custom arrow components using divs instead of buttons
  const CustomArrowNext = (onClickHandler) => (
    <div
      onClick={onClickHandler}
      className="absolute right-0 bottom-0 w-[30px] md:w-[50px]
          h-[30px] md:h-[50px] bg-black z-10 flex items-center justify-center cursor-pointer
          hover:opacity-90"
    >
      <BiArrowBack className="rotate-180 text-sm md:text-lg" />
    </div>
  );

  const CustomArrowPrev = (onClickHandler) => (
    <div
      onClick={onClickHandler}
      className="absolute right-[31px] md:right-[51px] bottom-0 w-[30px] md:w-[50px]
          h-[30px] md:h-[50px] bg-black z-10 flex items-center justify-center cursor-pointer
          hover:opacity-90"
    >
      <BiArrowBack className="text-sm md:text-lg" />
    </div>
  );

  return (
    <div className="text-white text-[20px] w-full max-w-[1360px] sticky top-[50px]">
      <Carousel
        selectedItem={selectedIndex}
        onChange={setSelectedIndex}
        renderArrowNext={CustomArrowNext}
        renderArrowPrev={CustomArrowPrev}
        infiniteLoop={true}
        showStatus={false}
        showIndicators={false}
        thumbWidth={60}
        className="productCarousel"
      >
        {images.map((imgUrl, index) => (
          <div key={`image-${index}`}>
            <img
              src={imgUrl}
              alt={`${data.name || 'Product'} - Image ${index + 1}`}
            />
          </div>
        ))}
      </Carousel>
    </div>
  );
}

export default ProductDetailLeft;
