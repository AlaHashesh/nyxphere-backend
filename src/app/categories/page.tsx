import CategoryList from "@/app/categories/CategoryList";

const CategoryPage = () => {
  return (
    <>
      <header
        className="flex items-center justify-between border-b border-white/5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <h1 className="text-base/7 font-semibold text-white">Categories</h1>
      </header>

      <div className="flex p-8 items-center">
        <CategoryList />
      </div>
    </>
  );
};

export default CategoryPage;