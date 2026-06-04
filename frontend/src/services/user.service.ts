import api from "../lib/config/axios.config";
import type { PaginatedResponse } from "../lib/types/common.type";
import type { UserQueryDto, UserPayload } from "../lib/dto/user.dto";
import type {
  UserBase,
  UserDetail,
  UserListItem,
} from "../lib/types/user.type";

export const UserService = {
  getAll: async (
    query?: UserQueryDto,
  ): Promise<PaginatedResponse<UserListItem>> => {
    const { data } = await api.get<PaginatedResponse<UserListItem>>("/user", {
      params: query,
    });
    return data;
  },

  getById: async (id: string): Promise<UserDetail> => {
    const { data } = await api.get<UserDetail>(`/user/${id}`);
    return data;
  },

  getUserByRoleId: async (
    id: string,
    query?: UserQueryDto,
  ): Promise<PaginatedResponse<UserDetail>> => {
    const { data } = await api.get<PaginatedResponse<UserDetail>>(
      `/user/finduserbyroleid/${id}`,
      { params: query },
    );
    return data;
  },

  create: async (payload: UserPayload): Promise<UserBase> => {
    const { data } = await api.post<UserBase>("/user", payload);
    return data;
  },

  update: async (
    id: string,
    payload: Partial<UserPayload>,
  ): Promise<UserBase> => {
    const { data } = await api.patch<UserBase>(`/user/${id}`, payload);
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/user/${id}`);
  },
};
