import api from "../lib/config/axios.config";
import type { BookListItem, BorrowRecord } from "../lib/types/book.type";
import type {
  DashboardStats,
  TopCategories,
} from "../lib/types/dashboard.type";

export const DashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await api.get<DashboardStats>("/dashboard/stats");
    return data;
  },

  getTopBooks: async (): Promise<BookListItem[]> => {
    const { data } = await api.get<BookListItem[]>("/dashboard/top-books");
    return data;
  },

  getTopCategories: async (): Promise<TopCategories[]> => {
    const { data } = await api.get<TopCategories[]>(
      "/dashboard/top-categories",
    );
    return data;
  },

  getRecentBorrows: async (): Promise<BorrowRecord[]> => {
    const { data } = await api.get<BorrowRecord[]>("/dashboard/recent-borrows");
    return data;
  },
};
