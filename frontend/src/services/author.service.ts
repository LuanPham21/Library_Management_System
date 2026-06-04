import api from "../lib/config/axios.config";
import type {
  AuthorBase,
  AuthorDetail,
  AuthorListItem,
} from "../lib/types/author.type";
import type { PaginatedResponse } from "../lib/types/common.type";
import type { AuthorPayload, AuthorQueryDto } from "../lib/dto/author.dto";

export const AuthorService = {
  getAll: async (
    query?: AuthorQueryDto,
  ): Promise<PaginatedResponse<AuthorListItem>> => {
    const { data } = await api.get<PaginatedResponse<AuthorListItem>>(
      "/author",
      { params: query },
    );
    return data;
  },

  getById: async (id: string): Promise<AuthorDetail> => {
    const { data } = await api.get<AuthorDetail>(`/author/${id}`);
    return data;
  },

  create: async (payload: AuthorPayload): Promise<AuthorBase> => {
    const { data } = await api.post<AuthorBase>("/author", payload);
    return data;
  },

  update: async (id: string, payload: AuthorPayload): Promise<AuthorBase> => {
    const { data } = await api.patch<AuthorBase>(`/author/${id}`, payload);
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/author/${id}`);
  },
};
