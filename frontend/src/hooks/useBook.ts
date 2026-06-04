import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import type { BookBase } from "../lib/types/book.type";
import type { BookPayload, BookQueryDto } from "../lib/dto/book.dto";
import { BookService } from "../services/book.service";

export const bookKeys = {
  all: ["books"] as const,
  lists: () => [...bookKeys.all, "list"] as const,
  list: (q: BookQueryDto) => [...bookKeys.lists(), q] as const,
  detail: (id: string) => [...bookKeys.all, "detail", id] as const,
  listBookByAuthor: (id: string, q: BookQueryDto) =>
    [...bookKeys.all, "author", id, q] as const,
  listBookByCategory: (id: string, q: BookQueryDto) =>
    [...bookKeys.all, "category", id, q] as const,
};

export const useBooks = (query: BookQueryDto = {}) =>
  useQuery({
    queryKey: bookKeys.list(query),
    queryFn: () => BookService.getAll(query),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });

export const useBooksByAuthorId = (id: string, query: BookQueryDto = {}) =>
  useQuery({
    queryKey: bookKeys.listBookByAuthor(id, query),
    queryFn: () => BookService.getBookByAuthorId(id, query),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
    enabled: !!id,
  });

export const useBooksByCategoryId = (id: string, query: BookQueryDto = {}) =>
  useQuery({
    queryKey: bookKeys.listBookByCategory(id, query),
    queryFn: () => BookService.getBookByCategoryId(id, query),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
    enabled: !!id,
  });

export const useBook = (id: string) =>
  useQuery({
    queryKey: bookKeys.detail(id),
    queryFn: () => BookService.getById(id),
    enabled: !!id,
  });

export const useCreateBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BookPayload) => BookService.create(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
      queryClient.setQueryData<BookBase>(bookKeys.detail(data.id), data);
    },
  });
};

export const useUpdateBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<BookPayload>;
    }) => BookService.update(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
      queryClient.setQueryData<BookBase>(bookKeys.detail(data.id), data);
    },
  });
};

export const useDeleteBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => BookService.remove(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
      queryClient.removeQueries({ queryKey: bookKeys.detail(id) });

      queryClient.invalidateQueries({ queryKey: ["authors"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["borrowRecords"] });
    },
  });
};
