"use client";

import { useAdminCategories } from "../requests/admin/categories";
import { Loading } from "../components/Loading";

const AdminPage = () => {
  const { data: categories, isPending: isLoading } = useAdminCategories();

  if (isLoading) {
    return <Loading />;
  }

  console.log(isLoading, categories);

  return (
    <div>
      Hello
    </div>
  );
};

export default AdminPage;