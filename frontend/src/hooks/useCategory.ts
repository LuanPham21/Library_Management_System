import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";

import type { CategoryBase } from "../lib/types/category.type";
import { CategoryService } from "../services/category.service";
import {
  CategoryQueryDto,
  type CategoryPayload,
} from "../lib/dto/category.dto";

export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (q: CategoryQueryDto) => [...categoryKeys.lists(), q] as const,
  detail: (id: string) => [...categoryKeys.all, "detail", id] as const,
};

export const useCategories = (query: CategoryQueryDto = {}) =>
  useQuery({
    queryKey: categoryKeys.list(query),
    queryFn: () => CategoryService.getAll(query),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });

export const useCategory = (id: string) =>
  useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => CategoryService.getById(id),
    enabled: !!id,
  });

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CategoryPayload) => CategoryService.create(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.setQueryData<CategoryBase>(
        categoryKeys.detail(data.id),
        data,
      );
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CategoryPayload }) =>
      CategoryService.update(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.setQueryData<CategoryBase>(
        categoryKeys.detail(data.id),
        data,
      );
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => CategoryService.remove(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.removeQueries({ queryKey: categoryKeys.detail(id) });
    },
  });
};
