import api from "../lib/config/axios.config";
import type {
  BorrowRecordQueryDto,
  CreateBorrowRecordPayload,
  UpdateBorrowRecordPayload,
} from "../lib/dto/book.dto";
import type { BorrowRecord } from "../lib/types/book.type";
import type { PaginatedResponse } from "../lib/types/common.type";

export const BorrowRecordService = {
  getAll: async (
    query?: BorrowRecordQueryDto,
  ): Promise<PaginatedResponse<BorrowRecord>> => {
    const { data } = await api.get<PaginatedResponse<BorrowRecord>>("/borrow", {
      params: query,
    });
    return data;
  },

  getById: async (id: string): Promise<BorrowRecord> => {
    const { data } = await api.get<BorrowRecord>(`/borrow/${id}`);
    return data;
  },

  getBorrowRecordByBookId: async (
    id: string,
    query?: BorrowRecordQueryDto,
  ): Promise<PaginatedResponse<BorrowRecord>> => {
    const { data } = await api.get<PaginatedResponse<BorrowRecord>>(
      `/borrow/findborrowrecordbybookid/${id}`,
      { params: query },
    );
    return data;
  },

  getBorrowRecordByUserId: async (
    id: string,
    query?: BorrowRecordQueryDto,
  ): Promise<PaginatedResponse<BorrowRecord>> => {
    const { data } = await api.get<PaginatedResponse<BorrowRecord>>(
      `/borrow/findborrowrecordbyuserid/${id}`,
      { params: query },
    );
    return data;
  },

  create: async (payload: CreateBorrowRecordPayload): Promise<BorrowRecord> => {
    const { data } = await api.post<BorrowRecord>("/borrow", payload);
    return data;
  },

  update: async (
    id: string,
    payload: UpdateBorrowRecordPayload,
  ): Promise<BorrowRecord> => {
    const { data } = await api.patch<BorrowRecord>(`/borrow/${id}`, payload);
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/borrow/${id}`);
  },
};
