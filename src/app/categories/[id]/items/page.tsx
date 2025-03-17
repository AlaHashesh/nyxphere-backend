import { notFound } from "next/navigation";
import { findById, findParent } from "@/app/services/categoryService";
import ItemsList from "@/app/categories/[id]/items/ItemsList";

export type SubCategoryPageParams = {
  id: string;
}

type Props = {
  params: Promise<SubCategoryPageParams>;
};

const ItemsPage = async ({ params }: Props) => {
  const { id } = await params;

  try {
    await findById(id);
  } catch (error) {
    notFound();
  }

  const { snapshot } = await findParent(id);
  const parentId = snapshot.data().id as string;

  return (
    <>
      <header
        className="flex items-center justify-between border-b border-white/5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="sm:flex-auto">
          <h1 className="text-base/7 font-semibold text-white">Items</h1>
          <p className="mt-2 text-sm text-gray-300">
            A list of all the items.
          </p>
        </div>
      </header>

      <ItemsList categoryParentId={parentId} categoryId={id} />
    </>
  );
};

export default ItemsPage;