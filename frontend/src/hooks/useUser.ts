import {
  useQuery,
  keepPreviousData,
  useQueryClient,
  useMutation,
} from "@tanstack/react-query";

import { UserService } from "../services/user.service";
import type { UserBase } from "../lib/types/user.type";
import type { UserQueryDto, UserPayload } from "../lib/dto/user.dto";

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (q: UserQueryDto) => [...userKeys.lists(), q] as const,
  detail: (id: string) => [...userKeys.all, "detail", id] as const,
  listUserByRole: (id: string, q: UserQueryDto) =>
    [...userKeys.all, "role", id, q] as const,
};

export const useUsers = (query: UserQueryDto = {}) =>
  useQuery({
    queryKey: userKeys.list(query),
    queryFn: () => UserService.getAll(query),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });

export const useUsersByRoleId = (id: string, query: UserQueryDto = {}) =>
  useQuery({
    queryKey: userKeys.listUserByRole(id, query),
    queryFn: () => UserService.getUserByRoleId(id, query),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
    enabled: !!id,
  });

export const useUser = (id: string) =>
  useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => UserService.getById(id),
    enabled: !!id,
  });

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UserPayload) => UserService.create(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.setQueryData<UserBase>(userKeys.detail(data.id), data);
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<UserPayload>;
    }) => UserService.update(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.setQueryData<UserBase>(userKeys.detail(data.id), data);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => UserService.remove(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.removeQueries({ queryKey: userKeys.detail(id) });
    },
  });
};
