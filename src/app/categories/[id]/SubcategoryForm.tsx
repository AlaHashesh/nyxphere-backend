import z from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { useCreateAdminSubcategory, useUpdateAdminCategory } from "@/app/requests/admin/categories";
import { Category } from "@/app/requests/admin/categories/types";

const FormSchema = z
  .object({
    categoryId: z.string()
      .regex(/^[a-z-]+$/, "Only lowercase letters and dashes are allowed"),
    title: z.string().trim().min(1)
  });

export type FormInputs = z.infer<typeof FormSchema>;

type Props = {
  action: "create" | "update"
  category?: Category;
  parentId: string;
  onSuccess: () => void;
  onCancel: () => void;
};

const SubcategoryForm = (props: Props) => {
  const { parentId, onSuccess, onCancel, action } = props;

  const categoryId = useMemo(() => {
    return props.category?.id;
  }, [props.category?.id]);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormInputs>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      categoryId: categoryId,
      title: props.category?.title
    }
  });

  const { mutateAsync: createSubCategory, isPending: isCreatingSubcategory } = useCreateAdminSubcategory();
  const { mutateAsync: updateCategory, isPending: isUpdatingCategory } = useUpdateAdminCategory();

  const isLoading = useMemo(() => {
    return isCreatingSubcategory || isUpdatingCategory;
  }, [isCreatingSubcategory, isUpdatingCategory]);

  const onSubmit: SubmitHandler<FormInputs> = useCallback(async (data) => {
    try {
      if (action == "create") {
        await createSubCategory({
          parentId: parentId,
          id: data.categoryId,
          title: data.title
        });
      } else {
        if (!categoryId) {
          toast.error("Category ID is missing");
          return;
        }
        await updateCategory({
          parentId: parentId,
          id: categoryId,
          title: data.title
        });
      }
      onSuccess();
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      } else {
        toast.error("Error occurred while creating/updating Subcategory");
      }
    }
  }, [action, createSubCategory, onSuccess, parentId, categoryId, updateCategory]);

  return (
    <form action="#" method="POST" className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-12">
        <div className="border-b border-white/10 pb-12">
          <h2 className="text-base/7 font-semibold text-white text-center">New Category</h2>

          <div className={"mt-6"}>
            <label htmlFor="categoryId" className="block text-sm/6 font-medium text-white">
              Category ID
            </label>
            <div className="mt-2">
              <input
                {...register("categoryId")}
                type="text"
                disabled={!!categoryId || isLoading}
                className={`block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white 
                  outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 
                  focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6 disabled:cursor-not-allowed
                  ${errors.categoryId && "!text-red-700 !outline-red-300 !placeholder:text-red-300" || ""}
                  `
                }
              />
              {errors.categoryId && (
                <p className="mt-2 text-sm text-red-700">
                  {errors.categoryId.message}
                </p>
              )}
            </div>
          </div>

          <div className={"mt-6"}>
            <label htmlFor="title" className="block text-sm/6 font-medium text-white">
              Category Title
            </label>
            <div className="mt-2">
              <input
                {...register("title")}
                type="text"
                disabled={isLoading}
                className={`block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white 
                  outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 
                  focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6 disabled:cursor-not-allowedl
                  ${errors.title && "!text-red-700 !outline-red-300 !placeholder:text-red-300" || ""}
                  `
                }
              />
              {errors.title && (
                <p className="mt-2 text-sm text-red-700">
                  {errors.title.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          type="button"
          disabled={isLoading}
          className={`text-sm/6 font-semibold text-white ${isLoading ? "cursor-not-allowed" : "cursor-pointer"}`}
          onClick={() => onCancel()}>
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={`flex items-center rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-xs 
          hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500
          ${isLoading ? "cursor-not-allowed" : "cursor-pointer"}`}
        >
          {isLoading && (
            <svg aria-hidden="true" role="status"
                 className="mr-3 w-4 h-4 text-white animate-spin flex justify-center items-center"
                 viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="#E5E7EB"></path>
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentColor"></path>
            </svg>
          )}
          {isLoading ? "Loading" : "Save"}
        </button>
      </div>
    </form>
  );
};

export default SubcategoryForm;
