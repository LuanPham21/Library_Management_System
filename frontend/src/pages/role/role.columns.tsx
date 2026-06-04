import {
  UserOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { Button, Space, Tag, Typography } from "antd";

import type { UserDetail } from "../../lib/types/user.type";
import type { RoleBase, RoleListItem } from "../../lib/types/role.type";

const { Text } = Typography;

export const buildUserColumns = (): ColumnsType<NonNullable<UserDetail>> => [
  {
    title: "Tên",
    dataIndex: "name",
    key: "name",
    render: (v: string) => <Text strong>{v}</Text>,
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
    width: 250,
    render: (v: string) => <Text type="secondary">{v}</Text>,
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
];

type BuildRoleColumnsProps = {
  page: number;
  pageSize: number;
  onDetail: (id: string) => void;
  onEdit: (item: RoleBase) => void;
  onDelete: (item: RoleBase) => void;
};

export const buildRoleColumns = ({
  page,
  pageSize,
  onDetail,
  onEdit,
  onDelete,
}: BuildRoleColumnsProps): ColumnsType<RoleListItem> => [
  {
    title: "#",
    key: "index",
    width: 60,
    render: (_, __, idx) => (page - 1) * pageSize + idx + 1,
  },
  {
    title: "Tên quyền",
    dataIndex: "name",
    key: "name",
    render: (v: string) => <Text strong>{v}</Text>,
  },
  {
    title: "Người dùng",
    key: "userCount",
    width: 130,
    render: (_, r) => (
      <Tag icon={<UserOutlined />} color="blue">
        {r.userCount ?? 0} người
      </Tag>
    ),
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
