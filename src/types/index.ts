import { Conversation, DirectMessage, User } from "@prisma/client";

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

export interface Product {
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

export interface CartItem {
  id: string;
  userId: string;
  productSizeId: string;
  productName: string;
  productPrice: number;
  productPhotoUrl?: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  selectedSize?: string;
}

export interface UpdateCartItemDto {
  quantity: number;
}
