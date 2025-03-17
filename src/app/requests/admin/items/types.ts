export type Item = {
  id: string;
  sourceId: string;
  title: string;
  language: string;
  categoryIds: string[];
  audio: string;
  icon: string;
  free: boolean;
}

export type ItemRequest = Item & {
  categoryId: string;
}