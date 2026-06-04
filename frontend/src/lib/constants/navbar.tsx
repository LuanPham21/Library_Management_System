import type { ReactNode } from 'react';
import {
    UserOutlined,
    BookOutlined,
    SafetyCertificateOutlined,
    TeamOutlined,
    AppstoreOutlined,
    ReadOutlined,
} from '@ant-design/icons';

type NavItem = {
    key: string;
    label: string;
    icon: ReactNode;
    path: string;
};

export const NAV_BAR: NavItem[] = [
    {
        key: "authors",
        label: "Tác giả",
        icon: <UserOutlined />,
        path: "/authors",
    },
    {
        key: "books",
        label: "Sách",
        icon: <BookOutlined />,
        path: "/books",
    },
    {
        key: "roles",
        label: "Quyền",
        icon: <SafetyCertificateOutlined />,
        path: "/roles",
    },
    {
        key: "users",
        label: "Người dùng",
        icon: <TeamOutlined />,
        path: "/users",
    },
    {
        key: "category",
        label: "Danh mục",
        icon: <AppstoreOutlined />,
        path: "/categories",
    },
    {
        key: "borrow",
        label: "Phiếu mượn sách",
        icon: <ReadOutlined />,
        path: "/borrow",
    },
];