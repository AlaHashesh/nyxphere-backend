export type Category = {
  id: string;
  title: string;
  parentId: string;
}

export type Subcategory = Category;

export type CategoryRequest = {
  id: string;
  title: string;
  parentId: string;
}

export type SubcategoryRequest = CategoryRequest;