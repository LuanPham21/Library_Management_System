import {
  useQuery,
  keepPreviousData,
  useQueryClient,
  useMutation,
} from "@tanstack/react-query";
import type { RolePayload, RoleQueryDto } from "../lib/dto/role.dto";
import type { RoleBase } from "../lib/types/role.type";
import { RoleService } from "../services/role.service";

export const roleKeys = {
  all: ["roles"] as const,
  lists: () => [...roleKeys.all, "list"] as const,
  list: (q: RoleQueryDto) => [...roleKeys.lists(), q] as const,
  detail: (id: string) => [...roleKeys.all, "detail", id] as const,
};

export const useRoles = (query: RoleQueryDto = {}) =>
  useQuery({
    queryKey: roleKeys.list(query),
    queryFn: () => RoleService.getAll(query),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });

export const useRole = (id: string) =>
  useQuery({
    queryKey: roleKeys.detail(id),
    queryFn: () => RoleService.getById(id),
    enabled: !!id,
  });

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RolePayload) => RoleService.create(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.setQueryData<RoleBase>(roleKeys.detail(data.id), data);
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RolePayload }) =>
      RoleService.update(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.setQueryData<RoleBase>(roleKeys.detail(data.id), data);
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => RoleService.remove(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.removeQueries({ queryKey: roleKeys.detail(id) });
    },
  });
};
