import SubcategoryList from "@/app/categories/[id]/SubcategoryList";
import { db } from "@/lib/firebase/serverApp";
import { notFound } from "next/navigation";

export type SubCategoryPageParams = {
  id: string;
}

type Props = {
  params: Promise<SubCategoryPageParams>;
};

const SubCategoryPage = async ({ params }: Props) => {
  const { id } = await params;

  const docRef = db.collection("categories").doc(id);
  const docSnapshot = await docRef.get();
  if (!docSnapshot.exists) {
    notFound();
  }

  return (
    <>
      <header
        className="flex items-center justify-between border-b border-white/5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="sm:flex-auto">
          <h1 className="text-base/7 font-semibold text-white">Categories</h1>
          <p className="mt-2 text-sm text-gray-300">
            A list of all the categories.
          </p>
        </div>
      </header>

      <SubcategoryList id={id} />
    </>
  );
};

export default SubCategoryPage;