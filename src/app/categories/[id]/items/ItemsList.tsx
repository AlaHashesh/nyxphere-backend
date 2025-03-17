"use client";

import { useAdminItems } from "@/app/requests/admin/items";
import { Loading } from "@/app/components/Loading";
import Modal, { ModalRef } from "@/app/components/Modal";
import { useCallback, useRef, useState } from "react";
import ItemForm from "@/app/categories/[id]/items/ItemForm";
import { Item } from "@/app/requests/admin/items/types";

type Props = {
  categoryId: string;
  categoryParentId: string;
};

const SubcategoryList = ({ categoryId, categoryParentId }: Props) => {
  const modalRef = useRef<ModalRef>(null);
  const [action, setAction] = useState<"create" | "update">("create");
  const [item, setItem] = useState<Item | undefined>(undefined);

  const handleOnCreate = useCallback(() => {
    setAction("create");
    setItem(undefined);
    modalRef.current?.open();
  }, []);

  const handleOnUpdate = useCallback((item: Item) => {
    setAction("update");
    setItem(item);
    modalRef.current?.open();
  }, []);

  const { data: items, isPending: isLoading } = useAdminItems(categoryId);
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
            Add item
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
        </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
        {items?.map((item) => (
          <tr key={item.id}>
            <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-white sm:pl-0">
              {item.id}
            </td>
            <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-300">{item.title}</td>
            <td className="relative py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-0">
              <button
                type="button"
                onClick={() => handleOnUpdate(item)}
                className={`block rounded-md bg-indigo-500 px-3 py-2 text-center text-sm font-semibold text-white cursor-pointer
                 hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500`}
              >
                Edit
              </button>
            </td>
          </tr>
        ))}
        </tbody>
      </table>

      <Modal ref={modalRef}>
        <ItemForm
          action={action}
          item={item}
          categoryId={categoryId}
          categoryParentId={categoryParentId}
          onSuccess={() => modalRef.current?.close()}
          onCancel={() => modalRef.current?.close()} />
      </Modal>
    </div>
  );
};

export default SubcategoryList;