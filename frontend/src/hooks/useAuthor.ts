import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";

import type { AuthorBase } from "../lib/types/author.type";
import { AuthorService } from "../services/author.service";
import type { AuthorPayload, AuthorQueryDto } from "../lib/dto/author.dto";

export const authorKeys = {
  all: ["authors"] as const,
  lists: () => [...authorKeys.all, "list"] as const,
  list: (q: AuthorQueryDto) => [...authorKeys.lists(), q] as const,
  detail: (id: string) => [...authorKeys.all, "detail", id] as const,
};

export const useAuthors = (query: AuthorQueryDto = {}) =>
  useQuery({
    queryKey: authorKeys.list(query),
    queryFn: () => AuthorService.getAll(query),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });

export const useAuthor = (id: string) =>
  useQuery({
    queryKey: authorKeys.detail(id),
    queryFn: () => AuthorService.getById(id),
    enabled: !!id,
  });

export const useCreateAuthor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AuthorPayload) => AuthorService.create(payload),
    onSuccess: (newAuthor) => {
      queryClient.invalidateQueries({ queryKey: authorKeys.lists() });
      queryClient.setQueryData<AuthorBase>(
        authorKeys.detail(newAuthor.id),
        newAuthor,
      );
    },
  });
};

export const useUpdateAuthor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AuthorPayload }) =>
      AuthorService.update(id, payload),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: authorKeys.lists() });
      queryClient.setQueryData<AuthorBase>(
        authorKeys.detail(updated.id),
        updated,
      );
    },
  });
};

export const useDeleteAuthor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => AuthorService.remove(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: authorKeys.lists() });
      queryClient.removeQueries({ queryKey: authorKeys.detail(id) });
    },
  });
};
