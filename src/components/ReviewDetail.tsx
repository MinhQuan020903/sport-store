'use client';
import { CommonSvg } from '@/assets/CommonSvg';
import { useReview } from '@/hooks/useReview';
import { getSession } from 'next-auth/react';
import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Button } from './ui/button';
import DialogCustom from '@/components/ui/dialogCustom';
import { Controller, useForm } from 'react-hook-form';
import { Label } from './ui/label';
import { Input, Textarea, Spinner } from '@nextui-org/react';
import { toast } from 'react-hot-toast';

// Hook for checking if element is truncated or not
const useTruncatedElement = ({ ref }) => {
  const [isTruncated, setIsTruncated] = useState(false);
  const [isShowingMore, setIsShowingMore] = useState(false);

  // Check if element is truncated
  useLayoutEffect(() => {
    const { offsetHeight, scrollHeight } = ref.current || {};

    if (offsetHeight && scrollHeight && offsetHeight < scrollHeight) {
      setIsTruncated(true);
    } else {
      setIsTruncated(false);
    }
  }, [ref]);

  const toggleIsShowingMore = () => {
    setIsShowingMore((prev) => !prev);
  };

  return {
    isTruncated,
    isShowingMore,
    toggleIsShowingMore,
  };
};

const ReviewDetail = ({ data, onReviewUpdated }) => {
  const ref = useRef(null);
  const [isCurrentUserOwner, setIsCurrentUserOwner] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { onUpdateProductReview, onDeleteProductReview } = useReview();
  const { handleSubmit, control, reset, setValue } = useForm();

  const { isTruncated, isShowingMore, toggleIsShowingMore } =
    useTruncatedElement({
      ref,
    });

  // Check if current user is the owner of this review
  useEffect(() => {
    const checkOwnership = async () => {
      const session = await getSession();
      if (session?.user?.id === data.ownerId) {
        setIsCurrentUserOwner(true);
      }
    };

    checkOwnership();
  }, [data.ownerId]);

  // Setup form when edit dialog opens
  useEffect(() => {
    if (showEditDialog) {
      setValue('title', data.title);
      setValue('text', data.content);
      setValue('rating', data.rating.toString());
    }
  }, [showEditDialog, data, setValue]);

  // Create star array
  const starArray = Array.from(
    { length: Math.round(data.rating) },
    (_, index) => index + 1
  );
  const blankStarArray = Array.from(
    { length: 5 - Math.round(data.rating) },
    (_, index) => index + 1
  );

  // Handle edit submission
  const onEditSubmit = async (formData) => {
    setIsLoading(true);

    try {
      const result = await onUpdateProductReview(
        data.id,
        JSON.stringify({
          title: formData.title,
          content: formData.text,
          rating: parseFloat(formData.rating),
        })
      );

      if (result) {
        toast.success('Đánh giá đã được cập nhật!');
        setShowEditDialog(false);
        // Notify parent component to refresh data
        if (onReviewUpdated) onReviewUpdated();
      } else {
        toast.error('Không thể cập nhật đánh giá. Vui lòng thử lại!');
      }
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error('Đã xảy ra lỗi khi cập nhật đánh giá!');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    setIsLoading(true);

    try {
      const result = await onDeleteProductReview(data.id);

      if (result) {
        toast.success('Đánh giá đã được xóa!');
        setShowDeleteDialog(false);
        // Notify parent component to refresh data
        if (onReviewUpdated) onReviewUpdated();
      } else {
        toast.error('Không thể xóa đánh giá. Vui lòng thử lại!');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Đã xảy ra lỗi khi xóa đánh giá!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-[8px] lg:gap-[16px] border-b-2 border-x-zinc-900 px-5 py-6">
      <div className="flex flex-col sm:flex-row relative sm:items-center">
        <span className="font-bold text-sm md:text-xl">{data.title}</span>
        <span className="sm:ml-auto font-extralight text-[11px] md:text-sm xs:mt-1 mt-2 text-neutral-500">
          {new Date(data.createdAt).toLocaleString()}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-4 mb-0.5">
          {starArray.map((item, index) => (
            <div key={index}>{CommonSvg.startFilled('black', 5, 5)}</div>
          ))}
          {blankStarArray.map((item, index) => (
            <div key={index}>{CommonSvg.startFilled('gray', 5, 5)}</div>
          ))}
        </div>

        {isCurrentUserOwner && (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="p-1"
              onClick={() => setShowEditDialog(true)}
            >
              <FaEdit className="text-gray-600" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-1"
              onClick={() => setShowDeleteDialog(true)}
            >
              <FaTrash className="text-red-500" />
            </Button>
          </div>
        )}
      </div>

      <span className="font-semibold text-sm md:text-lg">
        {data.ownerName || 'Anonymous'}
      </span>

      <div>
        <p
          ref={ref}
          className={`break-words ${
            !isShowingMore && 'text-sm md:text-lg line-clamp-3'
          }`}
        >
          {data.content}
        </p>
        {isTruncated && (
          <button
            className="font-semibold text-sm md:text-lg"
            onClick={toggleIsShowingMore}
          >
            {isShowingMore ? 'Hiển thị ít hơn' : 'Hiển thị thêm'}
          </button>
        )}
      </div>

      {/* Edit Dialog */}
      {showEditDialog && (
        <DialogCustom
          warningOnClose={true}
          className="flex justify-center items-center w-[90%] lg:w-[60%] h-auto"
          isModalOpen={showEditDialog}
          setIsModalOpen={setShowEditDialog}
        >
          <div className="flex flex-col w-full h-auto pr-4 gap-6 p-4">
            <h2 className="text-xl font-bold text-center">
              Chỉnh Sửa Đánh Giá
            </h2>

            <div className="flex w-full flex-col gap-3">
              <Label className="font-semibold">Đánh giá (1-5 sao)</Label>
              <Controller
                control={control}
                name="rating"
                render={({ field }) => (
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            <div className="flex w-full flex-col gap-3">
              <Label className="font-semibold">Tiêu đề</Label>
              <Controller
                control={control}
                name="title"
                render={({ field }) => (
                  <Input
                    type="text"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            <div className="flex w-full flex-col gap-3">
              <Label className="font-semibold">Nội dung</Label>
              <Controller
                control={control}
                name="text"
                render={({ field }) => (
                  <Textarea
                    minRows={5}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            <div className="flex justify-center mt-4">
              <Button
                className="w-1/2"
                disabled={isLoading}
                onClick={handleSubmit(onEditSubmit)}
              >
                {isLoading ? <Spinner size="sm" /> : 'Lưu Thay Đổi'}
              </Button>
            </div>
          </div>
        </DialogCustom>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <DialogCustom
          className="w-[90%] lg:w-[40%] h-auto"
          isModalOpen={showDeleteDialog}
          setIsModalOpen={setShowDeleteDialog}
        >
          <div className="flex flex-col items-center p-6 gap-4">
            <h3 className="text-xl font-bold">Xác Nhận Xóa</h3>
            <p className="text-center">
              Bạn có chắc chắn muốn xóa đánh giá này không? Hành động này không
              thể hoàn tác.
            </p>

            <div className="flex gap-4 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={isLoading}
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading}
              >
                {isLoading ? <Spinner size="sm" /> : 'Xóa'}
              </Button>
            </div>
          </div>
        </DialogCustom>
      )}
    </div>
  );
};

export default ReviewDetail;
