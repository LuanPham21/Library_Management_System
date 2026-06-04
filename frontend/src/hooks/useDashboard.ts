import { useQuery } from "@tanstack/react-query";
import { DashboardService } from "../services/dashboard.service";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  stats: () => [...dashboardKeys.all, "stats"] as const,
  recentBorrows: () => [...dashboardKeys.all, "recent-borrows"] as const,
  topBooks: () => [...dashboardKeys.all, "top-books"] as const,
  topCategories: () => [...dashboardKeys.all, "top-categories"] as const,
};

export const useDashboardStats = () =>
  useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: DashboardService.getStats,
    staleTime: 10_000,
    refetchOnWindowFocus: true,
  });

export const useRecentBorrows = () =>
  useQuery({
    queryKey: dashboardKeys.recentBorrows(),
    queryFn: DashboardService.getRecentBorrows,
    staleTime: 10_000,
  });

export const useTopBooks = () =>
  useQuery({
    queryKey: dashboardKeys.topBooks(),
    queryFn: DashboardService.getTopBooks,
    staleTime: 10_000,
  });

export const useTopCategories = () =>
  useQuery({
    queryKey: dashboardKeys.topCategories(),
    queryFn: DashboardService.getTopCategories,
    staleTime: 10_000,
  });
