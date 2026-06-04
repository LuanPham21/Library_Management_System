import type { ColumnsType } from "antd/es/table";
import { Button, Space, Tag, Typography } from "antd";
import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";

import type { BookDetail } from "../../lib/types/book.type";
import type { AuthorListItem } from "../../lib/types/author.type";

const { Text } = Typography;

export const buildBookColumns = (): ColumnsType<NonNullable<BookDetail>> => [
  {
    title: "Tên sách",
    dataIndex: "title",
    key: "title",
    render: (title: string) => <Text strong>{title}</Text>,
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
  onEdit: (item: AuthorListItem) => void;
  onDelete: (item: AuthorListItem) => void;
};

export const buildAuthorColumns = ({
  page,
  pageSize,
  onDetail,
  onEdit,
  onDelete,
}: BuildAuthorColumnsProps): ColumnsType<AuthorListItem> => [
  {
    title: "#",
    key: "index",
    width: 60,
    render: (_, __, idx) => (page - 1) * pageSize + idx + 1,
  },
  {
    title: "Tên tác giả",
    dataIndex: "name",
    key: "name",
    render: (name: string) => <Text strong>{name}</Text>,
  },
  {
    title: "Số sách",
    key: "bookCount",
    width: 120,
    render: (_, record) => <Tag color="gold">{record.bookCount ?? 0} sách</Tag>,
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
    width: 140,
    align: "right",
    render: (_, record) => (
      <Space>
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => onDetail(record.id)}
        >
          Chi tiết
        </Button>
        <Button
          size="small"
          icon={<EditOutlined />}
          onClick={() => onEdit(record)}
        />
        <Button
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={() => onDelete(record)}
        />
      </Space>
    ),
  },
];
