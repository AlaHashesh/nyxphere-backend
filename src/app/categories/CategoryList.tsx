"use client";

import { useAdminCategories } from "@/app/requests/admin/categories";
import { Loading } from "@/app/components/Loading";
import Link from "next/link";

const CategoryList = () => {
  const { data: categories, isPending: isLoading } = useAdminCategories();
  if (isLoading) {
    return <Loading />;
  }
  return (
    <div className="flex gap-8">
      {categories?.map((category) => (
        <Link key={category.id} href={`/categories/${category.id}`}
              className={`block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-sm 
              hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700`}>

          <h1 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {category.title}
          </h1>
        </Link>
      ))}
    </div>
  );
};

export default CategoryList;