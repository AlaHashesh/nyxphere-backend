import z from "zod";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { Item } from "@/app/requests/admin/items/types";
import { useCreateAdminItem, useUpdateAdminItem } from "@/app/requests/admin/items";
import { useAdminSubCategories } from "@/app/requests/admin/categories";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Switch } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import Dropzone from "@/app/components/form/Dropzone";

const FormSchema = z
  .object({
    itemId: z.string()
      .regex(/^[a-z-]+$/, "Only lowercase letters and dashes are allowed"),
    title: z.string().trim().min(1),
    categoryIds: z.array(z.string().min(1)).min(1),
    icon: z.string().url(),
    free: z.boolean().default(false)
  });

export type FormInputs = z.infer<typeof FormSchema>;

type Props = {
  action: "create" | "update"
  item?: Item;
  categoryParentId: string;
  categoryId?: string;
  onSuccess: () => void;
  onCancel: () => void;
};

const ItemForm = (props: Props) => {
  const { categoryParentId, categoryId, onSuccess, onCancel, action } = props;

  const itemId = useMemo(() => {
    return props.item?.id;
  }, [props.item?.id]);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm<FormInputs>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      itemId: itemId,
      title: props.item?.title,
      categoryIds: props.item?.categoryIds ?? [],
      icon: props.item?.icon,
      free: props.item?.free || false
    }
  });

  const { data: categories } = useAdminSubCategories(categoryParentId);
  const { mutateAsync: createItem, isPending: isCreatingSubcategory } = useCreateAdminItem();
  const { mutateAsync: updateItem, isPending: isUpdatingCategory } = useUpdateAdminItem();

  const isLoading = useMemo(() => {
    return isCreatingSubcategory || isUpdatingCategory;
  }, [isCreatingSubcategory, isUpdatingCategory]);

  const onSubmit: SubmitHandler<FormInputs> = useCallback(async (data) => {
    if (categoryId && !data.categoryIds.includes(categoryId)) {
      setError("categoryIds", { type: "custom", message: "You must include current category as well" });
      return;
    }

    console.log("data", data);
    try {
      if (action == "create") {
        await createItem({
          id: data.itemId,
          sourceId: data.itemId,
          language: "en",
          title: data.title,
          categoryIds: [],
          audio: "",
          icon: "",
          free: false,
          categoryId: categoryId ?? ""
        });
      } else {
        if (!itemId) {
          toast.error("Item ID is missing");
          return;
        }
        // await updateCategory({
        //   parentId: parentId,
        //   id: categoryId,
        //   title: data.title
        // });
      }
      onSuccess();
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      } else {
        toast.error("Error occurred while creating/updating Subcategory");
      }
    }
  }, [action, onSuccess, createItem, categoryId, itemId]);

  return (
    <form action="#" method="POST" className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-12">
        <div className="border-b border-white/10 pb-12">
          <h2 className="text-base/7 font-semibold text-white text-center">New Item</h2>

          <div className={"mt-6"}>
            <label htmlFor="categoryId" className="block text-sm/6 font-medium text-white">
              Item ID
            </label>
            <div className="mt-2">
              <input
                {...register("itemId")}
                type="text"
                disabled={!!itemId || isLoading}
                className={`block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white 
                  outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 
                  focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6 disabled:cursor-not-allowed
                  ${errors.itemId && "!text-red-700 !outline-red-300 !placeholder:text-red-300" || ""}
                  `
                }
              />
            </div>
            {errors.itemId && (
              <p className="mt-2 text-sm text-red-700">
                {errors.itemId.message}
              </p>
            )}
          </div>

          <div className={"mt-6"}>
            <label htmlFor="title" className="block text-sm/6 font-medium text-white">
              Item Title
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
            </div>

            {errors.title && (
              <p className="mt-2 text-sm text-red-700">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className={"mt-6 "}>
            <label htmlFor="title" className="block text-sm/6 font-medium text-white">
              Category Ids
            </label>

            <div className="mt-2 relative">
              <Controller
                control={control}
                name="categoryIds"
                render={({ field: { onChange, value } }) => {
                  const selectedCategories = categories?.filter(category => value.includes(category.id)) ?? [];
                  return (
                    <Listbox value={value} onChange={onChange} multiple>

                      <ListboxButton
                        className={`grid w-full cursor-default grid-cols-1 rounded-md bg-white/5 text-base text-white 
                  py-1.5 pr-2 pl-3 text-left outline-1 -outline-offset-1 outline-white/10 focus:outline-2 
                  focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6
                  ${errors.categoryIds && "!text-red-700 !outline-red-300 !placeholder:text-red-300" || ""}`}>
                        <div className="flex col-start-1 row-start-1 truncate pr-6 min-h-6 gap-2 flex-wrap">

                          {selectedCategories.map((category) => (
                            <div
                              key={category.id}
                              className={`inline-flex items-center rounded-md bg-gray-400/10 px-2 py-1 text-xs font-medium
                         text-gray-400 ring-1 ring-gray-400/20 ring-inset`}>
                              {category.title}
                            </div>
                          ))}
                        </div>
                        <ChevronUpDownIcon
                          aria-hidden="true"
                          className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                        />
                      </ListboxButton>

                      <ListboxOptions
                        transition
                        className={`absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-gray-700 py-1 text-base 
                  ring-1 shadow-lg ring-black/5 focus:outline-hidden data-leave:transition data-leave:duration-100 
                  data-leave:ease-in data-closed:data-leave:opacity-0 sm:text-sm`}
                      >
                        {categories?.map((category) => (
                          <ListboxOption
                            key={category.id}
                            value={category.id}
                            className={`group relative cursor-default py-2 pr-4 pl-8 bg-red text-white select-none 
                      data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden`}
                          >
                            <div
                              className="block truncate font-normal group-data-selected:font-semibold">{category.title}</div>

                            <div
                              className="absolute inset-y-0 left-0 flex items-center pl-1.5 text-white group-not-data-selected:hidden group-data-focus:text-white">
                              <CheckIcon aria-hidden="true" className="size-5" />
                            </div>
                          </ListboxOption>
                        ))}
                      </ListboxOptions>
                    </Listbox>
                  );
                }}
              />
            </div>

            {errors.categoryIds && (
              <p className="mt-2 text-sm text-red-700">
                {errors.categoryIds.message}
              </p>
            )}
          </div>

          <div className={"mt-6"}>
            <label htmlFor="icon" className="block text-sm/6 font-medium text-white">
              Icon
            </label>

            <div className="mx-2">
              <Controller
                control={control}
                name="icon"
                render={({ field: { onChange, value } }) => (
                  <Dropzone className={'mt-2'} />
                )}
              />
            </div>

            {errors.icon && (
              <p className="mt-2 text-sm text-red-700">
                {errors.icon.message}
              </p>
            )}
          </div>

          <div className={"mt-6 flex items-center justify-between"}>
            <label htmlFor="title" className="block text-sm/6 font-medium text-white">
              Free?
            </label>

            <div className="mx-2">
              <Controller
                control={control}
                name="free"
                render={({ field: { onChange, value } }) => (
                  <Switch
                    checked={value}
                    onChange={onChange}
                    disabled={isLoading}
                    className="group relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:outline-hidden data-checked:bg-indigo-600"
                  >
                    <span className="sr-only">Use setting</span>
                    <span
                      aria-hidden="true"
                      className="pointer-events-none inline-block size-5 transform rounded-full bg-white ring-0 shadow-sm transition duration-200 ease-in-out group-data-checked:translate-x-5"
                    />
                  </Switch>
                )}
              />
            </div>

            {errors.free && (
              <p className="mt-2 text-sm text-red-700">
                {errors.free.message}
              </p>
            )}
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

export default ItemForm;
