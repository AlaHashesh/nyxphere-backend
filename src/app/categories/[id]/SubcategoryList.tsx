"use client";

import { useAdminSubCategories } from "@/app/requests/admin/categories";
import { Loading } from "@/app/components/Loading";
import Modal, { ModalRef } from "@/app/components/Modal";
import { useCallback, useRef, useState } from "react";
import SubcategoryForm from "@/app/categories/[id]/SubcategoryForm";
import { Category } from "@/app/requests/admin/categories/types";
import Link from "next/link";

type Props = {
  id: string;
};

const SubcategoryList = ({ id }: Props) => {
  const modalRef = useRef<ModalRef>(null);
  const [action, setAction] = useState<"create" | "update">("create");
  const [category, setCategory] = useState<Category | undefined>(undefined);

  const handleOnCreate = useCallback(() => {
    setAction("create");
    setCategory(undefined);
    modalRef.current?.open();
  }, []);

  const handleOnUpdate = useCallback((category: Category) => {
    setAction("update");
    setCategory(category);
    modalRef.current?.open();
  }, []);

  const { data: categories, isPending: isLoading } = useAdminSubCategories(id);
  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="inline-block min-w-full align-middle sm:px-6 lg:px-8">
      <div className="flex justify-end">
        <div className="mt-4 sm:mt-0 sm:ml-16 ">
          <button type="button"
                  onClick={() => handleOnCreate()}
                  className={`block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold cursor-pointer
                   text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`}>
            Add category
          </button>
        </div>
      </div>
      <table className="min-w-full divide-y divide-gray-700">
        <thead>
        <tr>
          <th scope="col" className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-white sm:pl-0">
            ID
          </th>
          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
            Title
          </th>
          <th scope="col" className="relative py-3.5 pr-4 pl-3 sm:pr-0">
            <span className="sr-only">Edit</span>
          </th>
          <th scope="col" className="relative py-3.5 pr-4 pl-3 sm:pr-0">
            <span className="sr-only">List Items</span>
          </th>
        </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
        {categories?.map((category) => (
          <tr key={category.id}>
            <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-white sm:pl-0">
              {category.id}
            </td>
            <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-300">{category.title}</td>
            <td className="relative py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-0">
              <button
                type="button"
                onClick={() => handleOnUpdate(category)}
                className={`block rounded-md bg-indigo-500 px-3 py-2 text-center text-sm font-semibold text-white cursor-pointer
                 hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500`}
              >
                Edit
              </button>
            </td>
            <td className="relative py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-0">
              <Link
                href={`/categories/${category.id}/items`}
                className={`block rounded-md bg-indigo-500 px-3 py-2 text-center text-sm font-semibold text-white
                 hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500`}
              >
                List
              </Link>
            </td>
          </tr>
        ))}
        </tbody>
      </table>

      <Modal ref={modalRef}>
        <SubcategoryForm
          action={action}
          category={category}
          parentId={id}
          onSuccess={() => modalRef.current?.close()}
          onCancel={() => modalRef.current?.close()} />
      </Modal>
    </div>
  );
};

export default SubcategoryList;