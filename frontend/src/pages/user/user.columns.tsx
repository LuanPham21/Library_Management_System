import { Typography, Tag, Button, Space } from "antd";
import type { ColumnsType } from "antd/es/table";

import type { BorrowStatus } from "../../lib/enum/library";
import type { BorrowRecord } from "../../lib/types/book.type";
import type { UserBase, UserListItem } from "../../lib/types/user.type";
import { EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

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
    title: "Sách",
    key: "book",
    render: (_, r) => <Text strong>{r.book?.title ?? "—"}</Text>,
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

type BuildUserColumnsProps = {
  page: number;
  pageSize: number;
  onDetail: (id: string) => void;
  onEdit: (item: UserBase) => void;
  onDelete: (item: UserBase) => void;
};

export const buildUserColumns = ({
  page,
  pageSize,
  onDetail,
  onEdit,
  onDelete,
}: BuildUserColumnsProps): ColumnsType<UserListItem> => [
  {
    title: "#",
    key: "index",
    width: 60,
    render: (_, __, idx) => (page - 1) * pageSize + idx + 1,
  },
  {
    title: "Họ tên",
    dataIndex: "name",
    key: "name",
    render: (v: string) => <Text strong>{v}</Text>,
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
    render: (v: string) => <Text type="secondary">{v}</Text>,
  },
  {
    title: "Quyền",
    key: "role",
    width: 130,
    render: (_, r) =>
      r.role ? (
        <Tag color="purple">{r.role.name}</Tag>
      ) : (
        <Text type="secondary">—</Text>
      ),
  },
  {
    title: "Lượt mượn",
    key: "borrowCount",
    width: 110,
    align: "center",
    render: (_, r) => <Tag color="gold">{r.borrowRecordCount ?? 0}</Tag>,
  },
  {
    title: "Ngày tạo",
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
