import { CONFIG } from "@/app/config";
import axiosInstance from "../../axiosInstance";
import { Item, ItemRequest } from "@/app/requests/admin/items/types";

const URL = `${CONFIG.baseUrl}/api/v1/admin`;

export const getAdminItems = (id: string) => {
  return axiosInstance.get<Item[]>(`${URL}/categories/${id}/items`);
};

export const createAdminItem = (payload: ItemRequest) => {
  return axiosInstance.post<Item>(`${URL}/categories/${payload.categoryId}/items`, {
    id: payload.id,
    title: payload.title
  });
};

export const updateAdminItem = (payload: ItemRequest) => {
  return axiosInstance.post<Item>(`${URL}/items/${payload.id}`, {
    title: payload.title
  });
};