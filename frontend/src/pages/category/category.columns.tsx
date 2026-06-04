import type { ColumnsType } from "antd/es/table";

import type { BookDetail } from "../../lib/types/book.type";
import { Button, Space, Tag, Typography } from "antd";
import type { CategoryListItem } from "../../lib/types/category.type";
import { EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

const { Text } = Typography;

export const buildBookColumns = (): ColumnsType<NonNullable<BookDetail>> => [
  {
    title: "Tên sách",
    dataIndex: "title",
    key: "title",
    render: (v: string) => <Text strong>{v}</Text>,
  },
  {
    title: "Số lượng",
    dataIndex: "quantity",
    key: "quantity",
    width: 150,
    align: "center",
    render: (qty: number) => <Tag color={qty > 0 ? "green" : "red"}>{qty}</Tag>,
  },
  {
    title: "Số lượt mượn",
    key: "borrowRecordCount",
    width: 150,
    render: (_, record) => (
      <Tag color="gold">{record.borrowRecordCount ?? 0}</Tag>
    ),
  },
];

type BuildAuthorColumnsProps = {
  page: number;
  pageSize: number;
  onDetail: (id: string) => void;
  onEdit: (item: CategoryListItem) => void;
  onDelete: (item: CategoryListItem) => void;
};

export const buildCategoryColumns = ({
  page,
  pageSize,
  onDetail,
  onEdit,
  onDelete,
}: BuildAuthorColumnsProps): ColumnsType<CategoryListItem> => [
  {
    title: "#",
    key: "index",
    width: 60,
    render: (_, __, idx) => (page - 1) * pageSize + idx + 1,
  },
  {
    title: "Tên danh mục",
    dataIndex: "name",
    key: "name",
    render: (v: string) => <Text strong>{v}</Text>,
  },
  {
    title: "Số sách",
    key: "bookCount",
    width: 120,
    render: (_, r) => <Tag color="blue">{r.bookCount ?? 0} sách</Tag>,
  },
  {
    title: "Ngày tạo",
    dataIndex: "createdAt",
    key: "createdAt",
    width: 160,
    render: (v: string) =>
      new Date(v).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
  },
  {
    title: "Thao tác",
    key: "action",
    width: 160,
    align: "right",
    render: (_, r) => (
      <Space>
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => onDetail(r.id)}
        >
          Chi tiết
        </Button>
        <Button
          size="small"
          icon={<EditOutlined />}
          onClick={() => onEdit(r)}
        />
        <Button
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={() => onDelete(r)}
        />
      </Space>
    ),
  },
];
