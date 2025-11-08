"use client";

import React, { useEffect, useState } from "react";
import { useFeaturedProducts, useProductCategories } from "@/hooks/useProducts";
import { WooCommerceProduct, WooCommerceProductCategory } from "@/types/wordpress";

export default function TestAPIPage() {
  const { data: featuredProducts, isLoading: isLoadingProducts, error: productsError } = useFeaturedProducts();
  const { data: categories, isLoading: isLoadingCategories, error: categoriesError } = useProductCategories({ per_page: 6 });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">API Connection Test</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Featured Products Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Featured Products</h2>

            {isLoadingProducts ? (
              <div className="text-center py-4">Loading products...</div>
            ) : productsError ? (
              <div className="text-red-500 py-4">Error loading products: {productsError.message}</div>
            ) : (
              <div>
                <div className="mb-4 text-green-600">✓ Successfully loaded {featuredProducts?.length || 0} products</div>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {featuredProducts?.map((product: WooCommerceProduct) => (
                    <div key={product.id} className="border-b pb-3">
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-gray-600">Price: ${product.price}</p>
                      <p className="text-sm text-gray-500">ID: {product.id}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product Categories Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Product Categories</h2>

            {isLoadingCategories ? (
              <div className="text-center py-4">Loading categories...</div>
            ) : categoriesError ? (
              <div className="text-red-500 py-4">Error loading categories: {categoriesError.message}</div>
            ) : (
              <div>
                <div className="mb-4 text-green-600">✓ Successfully loaded {categories?.length || 0} categories</div>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {categories?.map((category: WooCommerceProductCategory) => (
                    <div key={category.id} className="border-b pb-3">
                      <h3 className="font-medium">{category.name}</h3>
                      <p className="text-gray-600">Products: {category.count}</p>
                      <p className="text-sm text-gray-500">ID: {category.id}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">API Status</h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${!productsError ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>Products API: {!productsError ? 'Connected' : 'Error'}</span>
            </div>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${!categoriesError ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>Categories API: {!categoriesError ? 'Connected' : 'Error'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}