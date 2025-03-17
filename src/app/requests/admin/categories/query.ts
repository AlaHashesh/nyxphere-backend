import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createAdminSubcategory, getAdminCategories, getAdminSubcategories, updateAdminCategory } from "./api";
import { CategoryRequest, SubcategoryRequest } from "@/app/requests/admin/categories/types";

export const useAdminCategories = () => {
  return useQuery({
    queryKey: ["adminCategories"],
    queryFn: async () => {
      return getAdminCategories().then((res) => res.data);
    },
    retry: 0
  });
};

export const useAdminSubCategories = (id: string) => {
  return useQuery({
    queryKey: ["adminSubcategories", id],
    queryFn: async () => {
      return getAdminSubcategories(id).then((res) => res.data);
    },
    retry: 0,
  });
};

export const useCreateAdminSubcategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: SubcategoryRequest) => {
      return createAdminSubcategory(payload).then(async (res) => {
        await queryClient.invalidateQueries({
          queryKey: ["adminSubcategories", payload.parentId]
        });
        return res.data;
      });
    }
  });
};

export const useUpdateAdminCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CategoryRequest) => {
      return updateAdminCategory(payload).then(async (res) => {
        await queryClient.invalidateQueries({
          queryKey: ["adminSubcategories", payload.id]
        });

        if (payload.parentId) {
          await queryClient.invalidateQueries({
            queryKey: ["adminSubcategories", payload.parentId]
          });
        } else {
          await queryClient.invalidateQueries({
            queryKey: ["adminCategories"]
          });
        }
        return res.data;
      });
    }
  });
};