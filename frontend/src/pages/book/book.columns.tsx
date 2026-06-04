import type { ColumnsType } from "antd/es/table";
import { Button, Space, Tag, Typography } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

import type { BorrowStatus } from "../../lib/enum/library";
import type {
  BookBase,
  BookListItem,
  BorrowRecord,
} from "../../lib/types/book.type";

const { Text } = Typography;

const STATUS_COLOR: Record<BorrowStatus, string> = {
  BORROWED: "blue",
  Returned: "green",
  Overdue: "red",
};
const STATUS_LABEL: Record<BorrowStatus, string> = {
  BORROWED: "Đang mượn",
  Returned: "Đã trả",
  Overdue: "Quá hạn",
};

export const buildBorrowColumns = (): ColumnsType<
  NonNullable<BorrowRecord>
> => [
  {
    title: "Người mượn",
    key: "user",
    render: (_, r) => <Text strong>{r.user?.name ?? "—"}</Text>,
  },
  {
    title: "Ngày mượn",
    dataIndex: "borrowDate",
    key: "borrowDate",
    width: 120,
    render: (v: string) =>
      new Date(v).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
  },
  {
    title: "Hạn trả",
    dataIndex: "dueDate",
    key: "dueDate",
    width: 120,
    render: (v: string) =>
      new Date(v).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
  },
  {
    title: "Trạng thái",
    dataIndex: "status",
    key: "status",
    width: 120,
    render: (v: BorrowStatus) => (
      <Tag color={STATUS_COLOR[v]}>{STATUS_LABEL[v]}</Tag>
    ),
  },
];

type BuildBookColumnsProps = {
  page: number;
  pageSize: number;
  onDetail: (id: string) => void;
  onEdit: (item: BookBase) => void;
  onDelete: (item: BookBase) => void;
};

export const buildBookColumns = ({
  page,
  pageSize,
  onDetail,
  onEdit,
  onDelete,
}: BuildBookColumnsProps): ColumnsType<BookListItem> => [
  {
    title: "#",
    key: "index",
    width: 60,
    render: (_, __, idx) => (page - 1) * pageSize + idx + 1,
  },
  {
    title: "Tên sách",
    dataIndex: "title",
    key: "title",
    render: (v: string) => <Text strong>{v}</Text>,
  },
  {
    title: "Tác giả",
    key: "author",
    width: 160,
    render: (_, r) =>
      r.author ? (
        <Tag color="purple">{r.author.name}</Tag>
      ) : (
        <Text type="secondary">—</Text>
      ),
  },
  {
    title: "Danh mục",
    key: "category",
    width: 140,
    render: (_, r) =>
      r.category ? (
        <Tag color="blue">{r.category.name}</Tag>
      ) : (
        <Text type="secondary">—</Text>
      ),
  },
  {
    title: "Số lượng",
    dataIndex: "quantity",
    key: "quantity",
    width: 100,
    align: "center",
    render: (qty: number) => <Tag color={qty > 0 ? "green" : "red"}>{qty}</Tag>,
  },
  {
    title: "Ngày thêm",
    dataIndex: "createdAt",
    key: "createdAt",
    width: 140,
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
