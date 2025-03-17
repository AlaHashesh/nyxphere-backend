import { CONFIG } from "@/app/config";
import axiosInstance from "../../axiosInstance";
import { Category, CategoryRequest, Subcategory, SubcategoryRequest } from "@/app/requests/admin/categories/types";

const URL = `${CONFIG.baseUrl}/api/v1/admin`;

export const getAdminCategories = () => {
  return axiosInstance.get<Category[]>(`${URL}/categories`);
};

export const getAdminSubcategories = (id: string) => {
  return axiosInstance.get<Subcategory[]>(`${URL}/categories/${id}/subcategories`);
};

export const createAdminSubcategory = (payload: SubcategoryRequest) => {
  return axiosInstance.post<Subcategory>(`${URL}/categories/${payload.parentId}/subcategories`, {
    id: payload.id,
    title: payload.title
  });
};

export const updateAdminCategory = (payload: CategoryRequest) => {
  return axiosInstance.post<Subcategory>(`${URL}/categories/${payload.id}`, {
    title: payload.title,
    parentId: payload.parentId
  });
};