import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createAdminItem, getAdminItems, updateAdminItem } from "./api";
import { ItemRequest } from "@/app/requests/admin/items/types";

export const useAdminItems = (categoryId: string) => {
  return useQuery({
    queryKey: ["adminItems", categoryId],
    queryFn: async () => {
      return getAdminItems(categoryId).then((res) => res.data);
    },
    retry: 0
  });
};

export const useCreateAdminItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ItemRequest) => {
      return createAdminItem(payload).then(async (res) => {
        await queryClient.invalidateQueries({
          queryKey: ["adminItems", payload.categoryId]
        });
        return res.data;
      });
    }
  });
};

export const useUpdateAdminItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ItemRequest) => {
      return updateAdminItem(payload).then(async (res) => {
        await queryClient.invalidateQueries({
          queryKey: ["adminItems"]
        });

        return res.data;
      });
    }
  });
};