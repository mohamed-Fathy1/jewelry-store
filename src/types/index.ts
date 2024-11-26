export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  material: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  sizes?: string[];
}

export interface Category {
  id: string;
  name: string;
  image: string;
  description: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
