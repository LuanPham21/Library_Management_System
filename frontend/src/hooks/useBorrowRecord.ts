import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";

import type { BorrowRecord } from "../lib/types/book.type";
import { BorrowRecordService } from "../services/borrow-record.service";
import type {
  BorrowRecordQueryDto,
  CreateBorrowRecordPayload,
  UpdateBorrowRecordPayload,
} from "../lib/dto/book.dto";

export const borrowRecordKeys = {
  all: ["borrowRecords"] as const,
  lists: () => [...borrowRecordKeys.all, "list"] as const,
  list: (q: BorrowRecordQueryDto) => [...borrowRecordKeys.lists(), q] as const,
  detail: (id: string) => [...borrowRecordKeys.all, "detail", id] as const,
  listBorrowRecordByBook: (id: string, q: BorrowRecordQueryDto) =>
    [...borrowRecordKeys.all, "book", id, q] as const,
  listBorrowRecordByUser: (id: string, q: BorrowRecordQueryDto) =>
    [...borrowRecordKeys.all, "user", id, q] as const,
};

export const useBorrowRecords = (query: BorrowRecordQueryDto = {}) =>
  useQuery({
    queryKey: borrowRecordKeys.list(query),
    queryFn: () => BorrowRecordService.getAll(query),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });

export const useBorrowRecordByBookId = (
  id: string,
  query: BorrowRecordQueryDto = {},
) =>
  useQuery({
    queryKey: borrowRecordKeys.listBorrowRecordByBook(id, query),
    queryFn: () => BorrowRecordService.getBorrowRecordByBookId(id, query),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
    enabled: !!id,
  });

export const useBorrowRecordByUserId = (
  id: string,
  query: BorrowRecordQueryDto = {},
) =>
  useQuery({
    queryKey: borrowRecordKeys.listBorrowRecordByUser(id, query),
    queryFn: () => BorrowRecordService.getBorrowRecordByUserId(id, query),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
    enabled: !!id,
  });

export const useBorrowRecord = (id: string) =>
  useQuery({
    queryKey: borrowRecordKeys.detail(id),
    queryFn: () => BorrowRecordService.getById(id),
    enabled: !!id,
  });

export const useCreateBorrowRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBorrowRecordPayload) =>
      BorrowRecordService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: borrowRecordKeys.lists() });
    },
  });
};

export const useUpdateBorrowRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateBorrowRecordPayload;
    }) => BorrowRecordService.update(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: borrowRecordKeys.lists() });
      queryClient.setQueryData<BorrowRecord>(
        borrowRecordKeys.detail(data.id),
        data,
      );
    },
  });
};
