import api from "../lib/config/axios.config";
import type { PaginatedResponse } from "../lib/types/common.type";
import type { BookQueryDto, BookPayload } from "../lib/dto/book.dto";
import type {
  BookListItem,
  BookDetail,
  BookBase,
} from "../lib/types/book.type";

export const BookService = {
  getAll: async (
    query?: BookQueryDto,
  ): Promise<PaginatedResponse<BookListItem>> => {
    const { data } = await api.get<PaginatedResponse<BookListItem>>("/book", {
      params: query,
    });
    return data;
  },

  getById: async (id: string): Promise<BookDetail> => {
    const { data } = await api.get<BookDetail>(`/book/${id}`);
    return data;
  },

  getBookByAuthorId: async (
    id: string,
    query?: BookQueryDto,
  ): Promise<PaginatedResponse<BookDetail>> => {
    const { data } = await api.get<PaginatedResponse<BookDetail>>(
      `/book/findbookbyauthorid/${id}`,
      { params: query },
    );
    return data;
  },

  getBookByCategoryId: async (
    id: string,
    query?: BookQueryDto,
  ): Promise<PaginatedResponse<BookDetail>> => {
    const { data } = await api.get<PaginatedResponse<BookDetail>>(
      `/book/findbookbycategoryid/${id}`,
      { params: query },
    );
    return data;
  },

  create: async (payload: BookPayload): Promise<BookBase> => {
    const { data } = await api.post<BookBase>("/book", payload);
    return data;
  },

  update: async (
    id: string,
    payload: Partial<BookPayload>,
  ): Promise<BookBase> => {
    const { data } = await api.patch<BookBase>(`/book/${id}`, payload);
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/book/${id}`);
  },
};
