import type { CategoryBase } from "./category.type";

export interface DashboardStats {
  totalBooks: number;
  totalUsers: number;
  totalAuthors: number;
  totalCategories: number;
  totalBorrowed: number;
  returnedThisMonth: number;
  totalOverdue: number;
}

export interface TopCategories extends CategoryBase {
  borrowRecordCount: number;
  pct: number;
}
