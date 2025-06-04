import { Conversation, DirectMessage, User } from '@prisma/client';

// export type FullMessageType = DirectMessage & {
//   sender: User,
//   seen: User[]
// };

export type FullConversationType = Conversation & {
  userOne: User;
  userTwo: User;
  directMessages: DirectMessage[];
};

export interface ProductPhoto {
  id: string;
  url: string;
  isMain: boolean;
  productId: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  size: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  inStock: number;
  createdAt: string;
  updatedAt: string;
  mainPhotoUrl: string;
  photos: ProductPhoto[];
  categories: Category[];
  sizes: Size[];
}
export interface ProductCategory {
  productId: string;
  categoryId: string;
  createdAt: string;
}

export interface Size {
  id: string;
  size: string;
  quantity: number;
  productId: string;
  createdAt: string;
  updatedAt: string;
}
export interface User {
  id: string;
  name: string;
  email: string;
}

// Updated CartItem to match the .NET entity
export interface CartItem {
  userId: string;
  productId: string;
  productName?: string;
  productPrice?: number;
  productPhotoUrl?: string;
  quantity: number;
  selectedSize?: string;
  createdAt: string;
  updatedAt: string;
  // Include the product data for UI display purposes
  product?: Product;
}
