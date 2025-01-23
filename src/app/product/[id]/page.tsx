"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { client } from "@/sanity/lib/client";
import { useCart } from "@/app/context/cartContext";
import { useWishlist } from "@/app/context/WishlistContext";

interface Product {
  _id: string;
  name: string;
  imageUrl?: string;
  price: number;
  description: string;
  discountPercent: number;
  new: boolean;
  colors: string[];
  sizes: string[];
  stockLevel: number;
  category: string;
}

const fetchProductById = async (id: string): Promise<Product | null> => {
  const query = `*[_type == "products" && _id == $id][0]{
    _id,
    name,
    "imageUrl": image.asset->url,
    price,
    description,
    discountPercent,
    new,
    colors,
    sizes,
    stockLevel,
    category
  }`;

  return await client.fetch(query, { id });
};

const ProductDetails: React.FC = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();

  useEffect(() => {
    const getProduct = async () => {
      try {
        const data = await fetchProductById(id as string);
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    getProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-gray-200 w-full h-full py-[10%]">
        <div className="animate-text p-2 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-transparent text-5xl font-black bg-clip-text">
          Loading...
        </div>
        <div className="ml-4 h-10 w-10 border-8 border-t-transparent border-gray-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg font-medium text-gray-800">Product not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 bg-gradient-to-b from-white to-gray-100">
      <div className="max-w-5xl mx-auto px-4">
        <div className="shadow-lg rounded-lg overflow-hidden flex flex-col lg:flex-row bg-white">
          <div className="lg:w-1/2 flex items-center justify-center p-6">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={500}
                height={500}
                className="w-full h-auto object-contain rounded-lg"
              />
            ) : (
              <div className="w-full h-60 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-sm">No Image Available</span>
              </div>
            )}
          </div>

          <div className="lg:w-1/2 p-8 flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>
              {product.new && <span className="bg-green-500 text-white px-2 py-1 rounded text-sm">New Arrival</span>}
              <p className="text-gray-600 mt-4 mb-6 leading-relaxed">{product.description}</p>

              <div className="flex flex-wrap items-center mb-6">
                <span className="text-lg font-semibold text-gray-800">Price:</span>
                <p className="text-2xl font-bold text-green-600 ml-2">
                  Rs. {product.price.toFixed(2)}
                  {product.discountPercent > 0 && (
                    <span className="text-red-500 text-sm ml-2">
                      -{product.discountPercent}% Off
                    </span>
                  )}
                </p>
              </div>

              <div className="mb-6">
                <p className="text-sm font-medium text-gray-800">Available Colors:</p>
                <div className="flex gap-2 mt-2">
                  {product.colors.map((color, index) => (
                    <span
                      key={index}
                      className="w-6 h-6 rounded-full border border-gray-400"
                      style={{ backgroundColor: color }}
                    ></span>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm font-medium text-gray-800">Available Sizes:</p>
                <div className="flex gap-2 mt-2">
                  {product.sizes.map((size, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 border border-gray-400 rounded text-sm"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={() => addToCart(product)}
                className={`w-full py-3 rounded-lg text-white font-bold text-lg ${
                  product.stockLevel > 0
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
                disabled={product.stockLevel <= 0}
              >
                {product.stockLevel > 0 ? "Add to Cart" : "Out of Stock"}
              </button>

              <button
                onClick={() => addToWishlist(product)}
                className="w-full mt-4 py-3 rounded-lg bg-pink-500 text-white font-bold text-lg hover:bg-pink-600"
              >
                Add to Wishlist
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
