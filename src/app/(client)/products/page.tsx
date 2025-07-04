import React from 'react';
import AddProductDialog from '../(withHDFT)/(home)/AddProductDialog';
import ProductsPage from './ProductsPage';

export default function Page({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  // const sort = searchParams ? searchParams?.sort : null;
  // const gender = searchParams ? searchParams?.gender : null;
  // const categories = searchParams ? searchParams?.categories : null;
  // const subcategories = searchParams ? searchParams?.subcategories : null;
  // const price_range = searchParams ?searchParams?.price_range: null;
  // const q = searchParams ? searchParams?.q : null;
  return (
    <div className="w-full h-full">
      <ProductsPage
        q={searchParams?.q}
        sort={searchParams?.sort}
        categories={searchParams?.categories}
        price_range={searchParams?.price_range}
      />
      <AddProductDialog />
    </div>
  );
}
