'use client';
import { CommonSvg } from '@/assets/CommonSvg';
import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';

const ProductReviewRating = ({ reviewRatingData }) => {
  const averageRating = () => {
    if (reviewRatingData && reviewRatingData.averageRating > 0) {
      return reviewRatingData.averageRating.toFixed(1);
    }
    return '0.0';
  };

  const calculatePercentage = (count) => {
    if (reviewRatingData && reviewRatingData.reviewCount > 0) {
      return ((count / reviewRatingData.reviewCount) * 100).toFixed(1) + '%';
    }
    return '0%';
  };

  const fiveStarPercentage = () =>
    calculatePercentage(reviewRatingData?.fiveStarCount || 0);
  const fourStarPercentage = () =>
    calculatePercentage(reviewRatingData?.fourStarCount || 0);
  const threeStarPercentage = () =>
    calculatePercentage(reviewRatingData?.threeStarCount || 0);
  const twoStarPercentage = () =>
    calculatePercentage(reviewRatingData?.twoStarCount || 0);
  const oneStarPercentage = () =>
    calculatePercentage(reviewRatingData?.oneStarCount || 0);

  const ratingValue = averageRating();
  const starArray = Array.from(
    { length: Math.round(parseFloat(ratingValue)) },
    (_, index) => index + 1
  );
  const blankStarArray = Array.from(
    { length: 5 - Math.round(parseFloat(ratingValue)) },
    (_, index) => index + 1
  );

  return (
    <div className="flex flex-col overflow-auto items-center justify-center w-auto space-y-6 pb-16">
      <div className="flex flex-row p-1 w-full items-center justify-center">
        <div className="flex gap-4 mb-0.5 mx-1"></div>
        <div className="w-full flex items-center justify-center">
          {reviewRatingData == null ? (
            <div className="w-full">
              <Skeleton className="w-full">
                <div className="flex flex-col p-1 w-full gap-[15px] items-center justify-center">
                  <div>
                    <div className="flex flex-row p-1 w-full gap-4 items-center justify-center">
                      {starArray.map((_, index) => (
                        <div key={`filled-star-${index}`}>
                          {CommonSvg.startFilled('yellow', 6, 6)}
                        </div>
                      ))}
                      {blankStarArray.map((_, index) => (
                        <div key={`empty-star-${index}`}>
                          {CommonSvg.startFilled('red', 6, 6)}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-row p-1 w-full items-center justify-center">
                    <div className="mx-1 mb-1">
                      {[1].map((item) => {
                        return (
                          <div key={item}>
                            {' '}
                            {CommonSvg.startFilled('black', 5, 5)}
                          </div>
                        );
                      })}
                    </div>
                    <span className="flex flex-d text-2xl font-bold items-center justify-center">
                      {averageRating()}
                    </span>
                    <span className="inline-block text-2xl ml-8 font-semibold">
                      {`${
                        reviewRatingData ? reviewRatingData?.reviewCount : ''
                      } Đánh Giá`}
                    </span>
                  </div>
                  <div className="flex flex-row w-full justify-center items-center ">
                    <ul className="w-full justify-center items-center">
                      <li
                        key="five-star"
                        className="flex flex-row ml-1 border-collapse pb-2 items-center justify-between"
                      >
                        <div className="w-14 text-xs lg:text-sm pr-1 font-bold">
                          5 Sao
                        </div>
                        {reviewRatingData?.reviewCount ? (
                          <div className="h-4 xl:w-[75%] md:w-[60%] w-[50%] bg-slate-400 border-1 rounded-lg">
                            <div
                              className={`h-4 bg-slate-800 border-1 rounded-xl`}
                              style={{ width: fiveStarPercentage() }}
                            ></div>
                          </div>
                        ) : (
                          <Skeleton className="h-4 xl:w-[75%] md:w-[60%] w-[50%]" />
                        )}

                        {reviewRatingData?.reviewCount ? (
                          <span className="lg:w-[10%] w-[5%] inline-block text-[12px] sm:text-sm pl-1 text-center">
                            {fiveStarPercentage()}
                          </span>
                        ) : (
                          <span className="lg:w-[10%] w-[5%] inline-block text-[12px] sm:text-sm pl-1 text-center">
                            0 %
                          </span>
                        )}
                      </li>
                      <li
                        key="four-star"
                        className="flex flex-row ml-1 border-collapse pb-2 items-center justify-between"
                      >
                        <div className="w-14 text-xs lg:text-sm pr-1 font-bold">
                          4 Sao
                        </div>
                        {reviewRatingData?.reviewCount ? (
                          <div className="h-4 xl:w-[75%] md:w-[60%] w-[50%] bg-slate-400 border-1 rounded-lg">
                            <div
                              className={`h-4 bg-slate-800 border-1 rounded-xl`}
                              style={{ width: fourStarPercentage() }}
                            ></div>
                          </div>
                        ) : (
                          <Skeleton className="h-4 xl:w-[75%] md:w-[60%] w-[50%]" />
                        )}

                        {reviewRatingData?.reviewCount ? (
                          <span className="lg:w-[10%] w-[5%] inline-block text-[12px] sm:text-sm pl-1 text-center">
                            {fourStarPercentage()}
                          </span>
                        ) : (
                          <span className="lg:w-[10%] w-[5%] inline-block text-[12px] sm:text-sm pl-1 text-center">
                            0 %
                          </span>
                        )}
                      </li>
                      <li
                        key="three-star"
                        className="flex flex-row ml-1 border-collapse pb-2 items-center justify-between"
                      >
                        <div className="w-14 text-xs lg:text-sm pr-1 font-bold">
                          3 Sao
                        </div>
                        {reviewRatingData?.reviewCount ? (
                          <div className="h-4 xl:w-[75%] md:w-[60%] w-[50%] bg-slate-400 border-1 rounded-lg">
                            <div
                              className={`h-4 bg-slate-800 border-1 rounded-xl`}
                              style={{ width: threeStarPercentage() }}
                            ></div>
                          </div>
                        ) : (
                          <Skeleton className="h-4 xl:w-[75%] md:w-[60%] w-[50%]" />
                        )}

                        {reviewRatingData?.reviewCount ? (
                          <span className="lg:w-[10%] w-[5%] inline-block text-[12px] sm:text-sm pl-1 text-center">
                            {threeStarPercentage()}
                          </span>
                        ) : (
                          <span className="lg:w-[10%] w-[5%] inline-block text-[12px] sm:text-sm pl-1 text-center">
                            0 %
                          </span>
                        )}
                      </li>
                      <li
                        key="two-star"
                        className="flex flex-row ml-1 border-collapse pb-2 items-center justify-between"
                      >
                        <div className="w-14 text-xs lg:text-sm pr-1 font-bold">
                          2 Sao
                        </div>
                        {reviewRatingData?.reviewCount ? (
                          <div className="h-4 xl:w-[75%] md:w-[60%] w-[50%] bg-slate-400 border-1 rounded-lg">
                            <div
                              className={`h-4 bg-slate-800 border-1 rounded-xl`}
                              style={{ width: twoStarPercentage() }}
                            ></div>
                          </div>
                        ) : (
                          <Skeleton className="h-4 xl:w-[75%] md:w-[60%] w-[50%]" />
                        )}

                        {reviewRatingData?.reviewCount ? (
                          <span className="lg:w-[10%] w-[5%] inline-block text-[12px] sm:text-sm pl-1 text-center">
                            {twoStarPercentage()}
                          </span>
                        ) : (
                          <span className="lg:w-[10%] w-[5%] inline-block text-[12px] sm:text-sm pl-1 text-center">
                            0 %
                          </span>
                        )}
                      </li>
                      <li
                        key="one-star"
                        className="flex flex-row ml-1 border-collapse pb-2 items-center justify-between"
                      >
                        <div className="w-14 text-xs lg:text-sm pr-1 font-bold">
                          1 Sao
                        </div>
                        {reviewRatingData?.reviewCount ? (
                          <div className="h-4 xl:w-[75%] md:w-[60%] w-[50%] bg-slate-400 border-1 rounded-lg">
                            <div
                              className={`h-4 bg-slate-800 border-1 rounded-xl`}
                              style={{ width: oneStarPercentage() }}
                            ></div>
                          </div>
                        ) : (
                          <Skeleton className="h-4 xl:w-[75%] md:w-[60%] w-[50%]" />
                        )}

                        {reviewRatingData?.reviewCount ? (
                          <span className="lg:w-[10%] w-[5%] inline-block text-[12px] sm:text-sm pl-1 text-center">
                            {oneStarPercentage()}
                          </span>
                        ) : (
                          <span className="lg:w-[10%] w-[5%] inline-block text-[12px] sm:text-sm pl-1 text-center">
                            0 %
                          </span>
                        )}
                      </li>
                    </ul>
                  </div>
                </div>
              </Skeleton>
            </div>
          ) : reviewRatingData?.reviewCount == 0 ? (
            // Case 2: reviewRatingData is not null, but reviewCount is 0
            <div>
              <span className="text-2xl font-light">
                {' '}
                Chưa có đánh giá nào cả!
              </span>
            </div>
          ) : (
            // Case 3: reviewRatingData is not null and reviewCount is not 0
            <div className="flex flex-col p-1 w-full gap-[15px] items-center justify-center">
              <div>
                <div className="flex flex-row p-1 w-full gap-4 items-center justify-center">
                  {starArray.map((_, index) => (
                    <div key={`filled-star-${index}`}>
                      {CommonSvg.startFilled('black', 9, 9)}
                    </div>
                  ))}
                  {blankStarArray.map((_, index) => (
                    <div key={`empty-star-${index}`}>
                      {CommonSvg.startFilled('gray', 9, 9)}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-row p-1 w-full items-center justify-center">
                <div className="mx-1 mb-1">
                  {[1].map((item) => {
                    return (
                      <div key={item}>
                        {' '}
                        {CommonSvg.startFilled('black', 5, 5)}
                      </div>
                    );
                  })}
                </div>
                <span className="flex flex-d text-2xl font-bold items-center justify-center">
                  {averageRating()}
                </span>
                <span className="inline-block text-2xl ml-8 font-semibold">
                  {`${reviewRatingData?.reviewCount} Đánh Giá`}
                </span>
              </div>
              <div className="flex flex-row w-full p-8 md:ml-4 mr-4 xs:mr-0">
                <ul className="w-full">
                  <li
                    key="five-star"
                    className="flex flex-row items-center justify-between ml-1 pb-2"
                  >
                    <div className="w-14 text-xs sm:text-sm pr-1 font-bold">
                      5 Sao
                    </div>
                    {reviewRatingData?.reviewCount ? (
                      <div className="h-4 xl:w-[75%] md:w-[60%] w-[50%] bg-slate-400 rounded-lg">
                        <div
                          className={`h-4 bg-slate-800 rounded-xl`}
                          style={{ width: fiveStarPercentage() }}
                        ></div>
                      </div>
                    ) : (
                      <Skeleton className="h-4 xl:w-[75%] md:w-[60%] w-[50%]" />
                    )}

                    {reviewRatingData?.reviewCount ? (
                      <span className="lg:w-[10%] w-[5%] inline-block text-[12px] sm:text-sm pl-1 text-center">
                        {fiveStarPercentage()}
                      </span>
                    ) : (
                      <span className="lg:w-[10%] w-[5%] inline-block text-[12px] sm:text-sm pl-1 text-center">
                        0 %
                      </span>
                    )}
                  </li>

                  <li
                    key="four-star"
                    className="flex flex-row ml-1 pb-2 items-center justify-between"
                  >
                    <div className="w-14 text-xs sm:text-sm pr-1 font-bold">
                      4 Sao
                    </div>
                    {reviewRatingData?.reviewCount ? (
                      <div className="h-4 xl:w-[75%] md:w-[60%] w-[50%] bg-slate-400 rounded-lg">
                        <div
                          className={`h-4 bg-slate-800 rounded-xl`}
                          style={{ width: fourStarPercentage() }}
                        ></div>
                      </div>
                    ) : (
                      <Skeleton className="h-4 xl:w-[75%] md:w-[60%] w-[50%]" />
                    )}

                    {reviewRatingData?.reviewCount ? (
                      <span className="lg:w-[10%] w-[5%] inline-block text-[12px] sm:text-sm pl-1 text-center">
                        {fourStarPercentage()}
                      </span>
                    ) : (
                      <span className="lg:w-[10%] w-[5%] inline-block text-[12px] sm:text-sm pl-1 text-center">
                        0 %
                      </span>
                    )}
                  </li>
                  <li
                    key="three-star"
                    className="flex flex-row ml-1 pb-2 items-center justify-between"
                  >
                    <div className="w-14 text-xs sm:text-sm pr-1 font-bold">
                      3 Sao
                    </div>
                    {reviewRatingData?.reviewCount ? (
                      <div className="h-4 xl:w-[75%] md:w-[60%] w-[50%] bg-slate-400 rounded-lg">
                        <div
                          className={`h-4 bg-slate-800 rounded-xl`}
                          style={{ width: threeStarPercentage() }}
                        ></div>
                      </div>
                    ) : (
                      <Skeleton className="h-4 xl:w-[75%] md:w-[60%] w-[50%]" />
                    )}

                    {reviewRatingData?.reviewCount ? (
                      <span className="lg:w-[10%] w-[5%] inline-block text-[12px] sm:text-sm pl-1 text-center">
                        {threeStarPercentage()}
                      </span>
                    ) : (
                      <span className="lg:w-[10%] w-[5%] inline-block text-[12px] sm:text-sm pl-1 text-center">
                        0 %
                      </span>
                    )}
                  </li>
                  <li
                    key="two-star"
                    className="flex flex-row ml-1 pb-2 items-center justify-between"
                  >
                    <div className="w-14 text-xs sm:text-sm pr-1 font-bold">
                      2 Sao
                    </div>
                    {reviewRatingData?.reviewCount ? (
                      <div className="h-4 xl:w-[75%] md:w-[60%] w-[50%] bg-slate-400 rounded-lg">
                        <div
                          className={`h-4 bg-slate-800 rounded-xl`}
                          style={{ width: twoStarPercentage() }}
                        ></div>
                      </div>
                    ) : (
                      <Skeleton className="h-4 xl:w-[75%] md:w-[60%] w-[50%]" />
                    )}

                    {reviewRatingData?.reviewCount ? (
                      <span className="lg:w-[10%] w-[5%] inline-block text-[12px] sm:text-sm pl-1 text-center">
                        {twoStarPercentage()}
                      </span>
                    ) : (
                      <span className="lg:w-[10%] w-[5%] inline-block text-[12px] sm:text-sm pl-1 text-center">
                        0 %
                      </span>
                    )}
                  </li>
                  <li
                    key="one-star"
                    className="flex flex-row ml-1 pb-2 items-center justify-between"
                  >
                    <div className="w-14 text-xs sm:text-sm pr-1 font-bold">
                      1 Sao
                    </div>
                    {reviewRatingData?.reviewCount ? (
                      <div className="h-4 xl:w-[75%] md:w-[60%] w-[50%] bg-slate-400 rounded-lg">
                        <div
                          className={`h-4 bg-slate-800 rounded-xl`}
                          style={{ width: oneStarPercentage() }}
                        ></div>
                      </div>
                    ) : (
                      <Skeleton className="h-4 xl:w-[75%] md:w-[60%] w-[50%]" />
                    )}

                    {reviewRatingData?.reviewCount ? (
                      <span className="lg:w-[10%] w-[5%] inline-block text-[11px] sm:text-sm pl-1 text-center">
                        {oneStarPercentage()}
                      </span>
                    ) : (
                      <span className="lg:w-[10%] w-[5%] inline-block text-[11px] sm:text-sm pl-1 text-center">
                        0 %
                      </span>
                    )}
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductReviewRating;
