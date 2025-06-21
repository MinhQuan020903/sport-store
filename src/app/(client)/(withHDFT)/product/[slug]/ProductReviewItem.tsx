'use client';

import ReviewDetail from '@/components/ReviewDetail';
import React from 'react';
import { Pagination, Skeleton } from '@nextui-org/react';
import { useSession } from 'next-auth/react';

const ProductReviewItem = ({
  reviewItemData,
  currentPage,
  setCurrentPage,
  isFetched,
  onRefresh,
}) => {
  const ref = React.useRef(null);
  const { data: session } = useSession();
  const currentUserEmail = session?.user?.email;

  //Set page state when change review page index
  const onPageChange = (page) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
    setCurrentPage(page);
  };

  // Handle review updates (edit/delete)
  const handleReviewUpdated = () => {
    if (onRefresh) onRefresh();
  };

  const itemsPerPage = 3; // Set this to match your backend pagination
  const totalItems = Array.isArray(reviewItemData) ? reviewItemData.length : 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div ref={ref} className="pt-4">
      <div className="z-40 space-y-2 pt-4 flex flex-col items-center">
        <div className="flex flex-col w-full gap-y-3 items-center">
          {isFetched
            ? Array.isArray(reviewItemData) &&
              reviewItemData.map((item) => (
                <div className="p-1 w-full" key={item.id}>
                  <ReviewDetail
                    data={item}
                    onReviewUpdated={handleReviewUpdated}
                    canEditDelete={currentUserEmail === item.ownerEmail}
                  />
                </div>
              ))
            : [1, 2, 3].map((item) => (
                <div className="p-1 w-full" key={item}>
                  <Skeleton className="rounded" disableAnimation>
                    <ReviewDetail data={{ title: 'ABCDEF' }} />
                  </Skeleton>
                </div>
              ))}
        </div>
        {Array.isArray(reviewItemData) && reviewItemData.length > 0 && (
          <Pagination
            showControls
            total={totalPages}
            initialPage={1}
            onChange={(page) => {
              onPageChange(page);
            }}
            page={currentPage}
          />
        )}
      </div>
    </div>
  );
};

export default ProductReviewItem;
