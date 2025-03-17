import { useAdminCategories } from "@/app/requests/admin/categories";

const Categories = () => {
  const { data: categories } = useAdminCategories();
  console.log(categories);

  return (<></>);
};

export default Categories;