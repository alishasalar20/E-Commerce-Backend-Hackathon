"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { client } from "@/sanity/lib/client";
import { useCart } from "@/app/context/cartContext";
import { useWishlist } from "@/app/context/WishlistContext";
import SearchBar from "./SearchBar";
import Link from "next/link";

interface Product {
  _id: string;
  name: string;
  imageUrl?: string;
  price: number;
  description: string;
  discountPercent: number;
  discountPercentage: number;
  isFeaturedProduct: boolean;
  stockLevel: number;
  new: boolean;
  category: string;
  colors: string[];
  sizes: string[];
}

const fetchProducts = async (): Promise<Product[]> => {
  const query = `*[_type == "products"] {
    _id,
    name,
    "imageUrl": image.asset->url,
    price,
    description,
    discountPercent,
    new,
    category,
    colors,
    sizes
  }`;
  return await client.fetch(query);
};

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();

  useEffect(() => {
    const getProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    getProducts();
  }, []);

  const handleSearch = (query: string) => {
    const lowerCaseQuery = query.toLowerCase();
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(lowerCaseQuery)
    );
    setFilteredProducts(filtered);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-gray-50 w-full h-screen py-[10%]">
        <div className="animate-text p-2 bg-gradient-to-r from-green-500 via-purple-500 to-pink-500 text-transparent text-5xl font-black bg-clip-text">
          Loading...
        </div>
        <div className="ml-4 h-10 w-10 border-8 border-t-transparent border-gray-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Explore Our Products
        </h1>
        <SearchBar onSearch={handleSearch} />
        {filteredProducts.length === 0 ? (
          <div className="text-center text-gray-600 mt-10">
            No products found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transform hover:scale-105 transition-transform duration-200"
              >
                <div className="p-4">
                  {product.imageUrl ? (
                    <Link href={`/product/${product._id}`}>
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        width={300}
                        height={200}
                        className="w-full h-64 object-cover rounded-t-md"
                      />
                    </Link>
                  ) : (
                    <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">
                        No Image Available
                      </span>
                    </div>
                  )}
                  <div className="mt-4">
                    <h2 className="text-lg font-bold text-gray-800 truncate">
                      {product.name}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {product.category}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xl font-semibold text-green-600">
                        Rs. {product.price.toFixed(2)}
                      </span>
                      {product.discountPercent > 0 && (
                        <span className="text-sm text-red-500">
                          -{product.discountPercent}%
                        </span>
                      )}
                    </div>
                    {product.new && (
                      <span className="text-xs font-medium text-white bg-blue-500 px-2 py-1 rounded-full inline-block mt-2">
                        New Arrival
                      </span>
                    )}
                    <div className="flex mt-4 gap-2">
                      {product.colors.map((color, index) => (
                        <span
                          key={index}
                          className="w-5 h-5 rounded-full"
                          style={{ backgroundColor: color }}
                          title={color}
                        ></span>
                      ))}
                    </div>
                    <div className="mt-4 text-sm text-gray-700">
                      Available Sizes: {product.sizes.join(", ")}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => addToCart(product)}
                        className="flex-1 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 transition"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => addToWishlist(product)}
                        className="flex-1 px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-md hover:bg-green-600 transition"
                      >
                        Wishlist
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;