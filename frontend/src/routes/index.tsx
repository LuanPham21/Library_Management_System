import { createBrowserRouter } from "react-router-dom";

import LoginPage from "../pages/login";
import BookPage from "../pages/book";
import RolePage from "../pages/role";
import UserPage from "../pages/user";
import AuthorPage from "../pages/author";
import CategoryPage from "../pages/category";
import AppLayout from "../layouts/AppLayout";
import AuthLayout from "../layouts/AuthLayout";
import DashboardPage from "../pages/dashboard";
import BorrowRecordsPage from "../pages/borrowRecord";

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [{ path: "/login", element: <LoginPage /> }],
  },
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <DashboardPage /> },
      { path: "/dashboard", element: <DashboardPage /> },
      { path: "/books", element: <BookPage /> },
      { path: "/authors", element: <AuthorPage /> },
      { path: "/categories", element: <CategoryPage /> },
      { path: "/users", element: <UserPage /> },
      { path: "/roles", element: <RolePage /> },
      { path: "/borrow", element: <BorrowRecordsPage /> },
    ],
  },
]);
