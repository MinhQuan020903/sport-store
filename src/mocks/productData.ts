import { Category, Product, ProductCategory, User, CartItem } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Generate mock categories
export const mockCategories: Category[] = [
  {
    id: uuidv4(),
    name: 'Áo phông',
    description: 'Các loại áo phông thời trang',
    size: 'M,L,XL',
    type: 'clothing',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Quần Jean',
    description: 'Quần jean thời trang',
    size: '29,30,31,32',
    type: 'clothing',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Giày',
    description: 'Giày thời trang',
    size: '39,40,41,42',
    type: 'footwear',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Generate mock products
export const mockProducts: Product[] = [
  {
    id: uuidv4(),
    name: 'Áo phông trắng basic',
    description: 'Áo phông cotton chất lượng cao, phù hợp cho mọi dịp',
    price: 250000,
    inStock: 50,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    photos: [
      {
        id: uuidv4(),
        url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
        isMain: true,
        productId: '',
      },
    ],
  },
  {
    id: uuidv4(),
    name: 'Quần jean đen slim fit',
    description: 'Quần jean đen ôm vừa, phong cách hiện đại',
    price: 450000,
    inStock: 30,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    photos: [
      {
        id: uuidv4(),
        url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246',
        isMain: true,
        productId: '',
      },
    ],
  },
  {
    id: uuidv4(),
    name: 'Giày sneaker thể thao',
    description: 'Giày sneaker năng động, thoải mái cho mọi hoạt động',
    price: 750000,
    inStock: 25,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    photos: [
      {
        id: uuidv4(),
        url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
        isMain: true,
        productId: '',
      },
    ],
  },
  {
    id: uuidv4(),
    name: 'Áo khoác bomber',
    description: 'Áo khoác bomber phong cách thể thao, giữ ấm tốt',
    price: 850000,
    inStock: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    photos: [
      {
        id: uuidv4(),
        url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5',
        isMain: true,
        productId: '',
      },
    ],
  },
];

// Update productId in photos
mockProducts.forEach((product) => {
  product.photos.forEach((photo) => {
    photo.productId = product.id;
  });
});

// Mock user
export const mockUser: User = {
  id: uuidv4(),
  name: 'Test User',
  email: 'user@example.com',
};

// Generate product-category relationships
export const mockProductCategories: ProductCategory[] = [
  {
    productId: mockProducts[0].id,
    categoryId: mockCategories[0].id,
    createdAt: new Date().toISOString(),
  },
  {
    productId: mockProducts[1].id,
    categoryId: mockCategories[1].id,
    createdAt: new Date().toISOString(),
  },
  {
    productId: mockProducts[2].id,
    categoryId: mockCategories[2].id,
    createdAt: new Date().toISOString(),
  },
  {
    productId: mockProducts[3].id,
    categoryId: mockCategories[0].id,
    createdAt: new Date().toISOString(),
  },
];

// Mock API functions
export const fetchProducts = () => {
  return new Promise<Product[]>((resolve) => {
    setTimeout(() => {
      resolve(mockProducts);
    }, 500);
  });
};

export const fetchCategories = () => {
  return new Promise<Category[]>((resolve) => {
    setTimeout(() => {
      resolve(mockCategories);
    }, 500);
  });
};

export const fetchProductById = (id: string) => {
  return new Promise<Product | undefined>((resolve) => {
    setTimeout(() => {
      const product = mockProducts.find((p) => p.id === id);
      resolve(product);
    }, 300);
  });
};

// Generate mock cart items
export const generateMockCartItems = async (): Promise<CartItem[]> => {
  // Get 2 random products
  const selectedProducts = mockProducts.slice(0, 2);

  const cartItems: CartItem[] = selectedProducts.map((product) => ({
    userId: mockUser.id,
    productId: product.id,
    quantity: Math.floor(Math.random() * 3) + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    product: product,
  }));

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(cartItems);
    }, 300);
  });
};
