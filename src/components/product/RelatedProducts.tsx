"use client";

import { useEffect, useState } from "react";
import { Product } from "@/types/product.types";
import ProductCard from "./ProductCard";
import { colors } from "@/constants/colors";

interface RelatedProductsProps {
  productId: string;
}

const relatedProducts = [
  {
    _id: "2",
    productName: "Gold Chain Bracelet",
    productDescription: "Elegant gold chain bracelet",
    price: 499.99,
    salePrice: 499.99,
    discount: 0,
    discountPercentage: 0,
    defaultImage: {
      mediaUrl: "/images/IMG_3176.PNG",
      mediaId: "img1",
    },
    albumImages: [],
    category: {
      categoryName: "Bracelets",
      slug: "bracelets",
      image: {
        mediaUrl: "",
        mediaId: "",
      },
    },
    availableItems: 10,
    soldItems: 5,
    isSoldOut: false,
    isSale: false,
    expiredSale: 0,
    isExpiredSale: false,
    createdBy: "admin",
    slug: "gold-chain-bracelet",
    createdAt: Date.now(),
    id: "2",
  },
  {
    _id: "3",
    productName: "Diamond Earrings",
    productDescription: "Classic diamond studs",
    price: 799.99,
    salePrice: 799.99,
    discount: 0,
    discountPercentage: 0,
    defaultImage: {
      mediaUrl: "/images/IMG_3177.PNG",
      mediaId: "img2",
    },
    albumImages: [],
    category: {
      categoryName: "Earrings",
      slug: "earrings",
      image: {
        mediaUrl: "",
        mediaId: "",
      },
    },
    availableItems: 8,
    soldItems: 3,
    isSoldOut: false,
    isSale: false,
    expiredSale: 0,
    isExpiredSale: false,
    createdBy: "admin",
    slug: "diamond-earrings",
    createdAt: Date.now(),
    id: "3",
  },
  {
    _id: "4",
    productName: "Pearl Necklace",
    productDescription: "Elegant pearl strand",
    price: 599.99,
    salePrice: 599.99,
    discount: 0,
    discountPercentage: 0,
    defaultImage: {
      mediaUrl: "/images/IMG_2950.JPG",
      mediaId: "img3",
    },
    albumImages: [],
    category: {
      categoryName: "Necklaces",
      slug: "necklaces",
      image: {
        mediaUrl: "",
        mediaId: "",
      },
    },
    availableItems: 12,
    soldItems: 7,
    isSoldOut: false,
    isSale: false,
    expiredSale: 0,
    isExpiredSale: false,
    createdBy: "admin",
    slug: "pearl-necklace",
    createdAt: Date.now(),
    id: "4",
  },
];

export default function RelatedProducts({ productId }: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Filter out the current product from related products
    const filteredProducts = relatedProducts.filter((p) => p._id !== productId);
    setProducts(filteredProducts);
    setIsLoading(false);
  }, [productId]);

  if (products.length === 0) return null;

  return (
    <section className="mt-16">
      <h2
        className="text-2xl font-medium mb-8"
        style={{ color: colors.textPrimary }}
      >
        Related Products
      </h2>
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(4)
            .fill(0)
            .map((_, index) => (
              <ProductCard.Skeleton key={index} />
            ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
