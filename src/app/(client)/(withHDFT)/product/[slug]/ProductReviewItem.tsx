'use client';

import ReviewDetail from '@/components/ReviewDetail';
import React from 'react';
import { Pagination, Skeleton } from '@nextui-org/react';

const ProductReviewItem = ({
  reviewItemData,
  currentPage,
  setCurrentPage,
  isFetched,
  onRefresh,
}) => {
  const ref = React.useRef(null);

  //Set page state when change review page index
  const onPageChange = (page) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
    setCurrentPage(page);
  };

  // Handle review updates (edit/delete)
  const handleReviewUpdated = () => {
    if (onRefresh) onRefresh();
  };

  return (
    <div ref={ref} className="pt-4">
      <div className="z-40 space-y-2 pt-4 flex flex-col items-center">
        <div className="flex flex-col w-full gap-y-3 items-center">
          {isFetched
            ? reviewItemData?.items?.map((item) => (
                <div className="p-1 w-full" key={item.id}>
                  <ReviewDetail
                    data={item}
                    onReviewUpdated={handleReviewUpdated}
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
        {reviewItemData && reviewItemData.pagination ? (
          <Pagination
            showControls
            total={reviewItemData.pagination.totalPages || 1}
            initialPage={1}
            onChange={(page) => {
              onPageChange(page);
            }}
            page={currentPage}
          />
        ) : null}
      </div>
    </div>
  );
};

export default ProductReviewItem;
