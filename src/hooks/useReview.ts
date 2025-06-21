import axios from 'axios';
import Cookies from 'js-cookie';

export interface CreateReviewDto {
  title: string;
  content: string;
  rating: number;
  productId: string;
}

export interface UpdateReviewDto {
  title: string;
  content: string;
  rating: number;
}

export interface ReviewDto {
  id: string;
  title: string;
  content: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
  productId: string;
  productName: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
}

export interface ReviewParams {
  pageNumber?: number;
  pageSize?: number;
  productId?: string;
}

const getAuthHeaders = () => {
  // Try to get token from cookie first, then fallback to session
  const tokenFromCookie = Cookies.get('access_token');
  const token = tokenFromCookie;

  if (!token) {
    console.warn('No authentication token found');
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const getReviews = async (params: ReviewParams) => {
  console.log('Fetching reviews with params:', params);

  const queryParams = new URLSearchParams();
  if (params.pageNumber)
    queryParams.append('PageNumber', params.pageNumber.toString());
  if (params.pageSize)
    queryParams.append('PageSize', params.pageSize.toString());
  if (params.productId) queryParams.append('ProductId', params.productId);

  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/Reviews?${queryParams.toString()}`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
};

export const getReviewById = async (id: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/Reviews/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching review by ID:', error);
    throw error;
  }
};

export const createReview = async (data: CreateReviewDto) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/Reviews`, data, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

export const updateReview = async (id: string, data: UpdateReviewDto) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/api/Reviews/${id}`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

export const deleteReview = async (id: string) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/api/Reviews/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

export const getProductRating = async (productId: string) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/Products/${productId}/rating`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching product rating:', error);
    throw error;
  }
};

export const useReview = () => {
  const onGetProductReview = async (productId: string, page: number) => {
    const params: ReviewParams = {
      productId,
      pageNumber: page,
      pageSize: 3,
    };

    try {
      const response = await getReviews(params);
      return response;
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      return null;
    }
  };

  const onPostProductReview = async (data: string) => {
    try {
      const reviewData = JSON.parse(data) as CreateReviewDto;
      const response = await createReview(reviewData);
      return response;
    } catch (error) {
      console.error('Error posting product review:', error);
      return null;
    }
  };

  const onUpdateProductReview = async (id: string, data: string) => {
    try {
      const reviewData = JSON.parse(data) as UpdateReviewDto;
      const response = await updateReview(id, reviewData);
      return response;
    } catch (error) {
      console.error('Error updating product review:', error);
      return null;
    }
  };

  const onDeleteProductReview = async (id: string) => {
    try {
      const response = await deleteReview(id);
      return response;
    } catch (error) {
      console.error('Error deleting product review:', error);
      return null;
    }
  };

  const onGetProductReviewRating = async (productId: string) => {
    try {
      const reviews = await getReviews({ productId });

      // Calculate rating statistics
      if (!reviews || !reviews.items || reviews.items.length === 0) {
        return {
          totalReview: 0,
          totalFiveStar: 0,
          totalFourStar: 0,
          totalThreeStar: 0,
          totalTwoStar: 0,
          totalOneStar: 0,
        };
      }

      const totalReview = reviews.items.length;
      const totalFiveStar = reviews.items.filter((r) => r.rating === 5).length;
      const totalFourStar = reviews.items.filter((r) => r.rating === 4).length;
      const totalThreeStar = reviews.items.filter((r) => r.rating === 3).length;
      const totalTwoStar = reviews.items.filter((r) => r.rating === 2).length;
      const totalOneStar = reviews.items.filter((r) => r.rating === 1).length;

      return {
        totalReview,
        totalFiveStar,
        totalFourStar,
        totalThreeStar,
        totalTwoStar,
        totalOneStar,
      };
    } catch (error) {
      console.error('Error calculating product review ratings:', error);
      return null;
    }
  };

  const onGetProductRating = async (productId: string) => {
    try {
      const response = await getProductRating(productId);
      return response;
    } catch (error) {
      console.error('Error fetching product rating:', error);
      return null;
    }
  };

  return {
    onGetProductReview,
    onPostProductReview,
    onUpdateProductReview,
    onDeleteProductReview,
    onGetProductReviewRating, // You can keep this for backward compatibility
    onGetProductRating, // Add the new function
  };
};
