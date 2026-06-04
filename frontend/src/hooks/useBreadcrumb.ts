const PATH_LABEL: Record<string, string> = {
  dashboard: "Bảng điều kiển",
  authors: "Tác giả",
  books: "Sách",
  users: "Người dùng",
  categories: "Danh mục",
  roles: "Quyền",
  borrow: "Phiếu mượn sách",
};

export const useBreadcrumbs = (pathname: string) => {
  if (pathname === "/") return [];
  const segments = pathname.replace(/^\//, "").split("/").filter(Boolean);
  return segments.map((seg, idx) => ({
    label: PATH_LABEL[seg] ?? seg,
    path: "/" + segments.slice(0, idx + 1).join("/"),
    isLast: idx === segments.length - 1,
  }));
};
