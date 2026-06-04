import {
  Typography,
  Modal,
  Space,
  Button,
  Spin,
  Descriptions,
  Tag,
  Table,
  Empty,
  App,
  Form,
  Input,
  Select,
} from "antd";
import React, { useState } from "react";
import { EditOutlined } from "@ant-design/icons";

import {
  useUser,
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "../../hooks/useUser";
import type {
  UserDetail,
  UserBase,
  UserListItem,
} from "../../lib/types/user.type";
import { useRoles } from "../../hooks/useRole";
import { Toolbar } from "../../components/ui/toolbar";
import { buildBorrowColumns, buildUserColumns } from "./user.columns";
import { useBorrowRecordByUserId } from "../../hooks/useBorrowRecord";

const { Title, Text } = Typography;
const LIMIT = 10;
const BORROW_LIMIT = 5;

const DetailModal: React.FC<{
  userId: string | null;
  onClose: () => void;
  onEdit: (u: UserDetail) => void;
}> = ({ userId, onClose, onEdit }) => {
  const [page, setPage] = useState(1);

  const { data: user, isLoading } = useUser(userId ?? "");
  const { data: borrow, isLoading: isLoadingBorrow } = useBorrowRecordByUserId(
    userId ?? "",
    {
      page,
      pageSize: BORROW_LIMIT,
      search: "",
    },
  );
  const borrows = borrow?.data ?? [];
  const total = borrow?.meta.total ?? 0;

  return (
    <Modal
      open={!!userId}
      title="Chi tiết người dùng"
      onCancel={onClose}
      width={720}
      destroyOnHidden
      footer={
        <Space>
          <Button onClick={onClose}>Đóng</Button>
          {user && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                onClose();
                onEdit(user);
              }}
            >
              Chỉnh sửa
            </Button>
          )}
        </Space>
      }
    >
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin size="large" />
        </div>
      ) : user ? (
        <Space direction="vertical" style={{ width: "100%" }} size={24}>
          <Descriptions
            bordered
            size="small"
            column={{
              xs: 1,
              sm: 1,
              md: 2,
              lg: 2,
              xl: 2,
            }}
          >
            <Descriptions.Item label="Họ tên" span={2}>
              <Text strong style={{ fontSize: 15 }}>
                {user.name}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
            <Descriptions.Item label="Quyền">
              {user.role ? (
                <Tag color="purple">{user.role.name}</Tag>
              ) : (
                <Text type="secondary">—</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Số lượt mượn">
              <Tag color="gold">{user.borrowRecordCount} lượt</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {new Date(user.createdAt).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </Descriptions.Item>
          </Descriptions>

          <div>
            <Title level={5} style={{ marginBottom: 12 }}>
              Lịch sử mượn sách ({borrows.length ?? 0})
            </Title>
            {borrows && borrows.length > 0 ? (
              <Table
                rowKey="id"
                dataSource={borrows}
                loading={isLoadingBorrow}
                columns={buildBorrowColumns()}
                size="small"
                scroll={{ y: 240 }}
                pagination={{
                  current: page,
                  pageSize: BORROW_LIMIT,
                  total,
                  onChange: (p) => setPage(p),
                  showTotal: (t) => `Tổng ${t} phiếu mượn`,
                  showSizeChanger: false,
                }}
              />
            ) : (
              <Empty
                description="Chưa có lịch sử mượn sách"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </div>
        </Space>
      ) : null}
    </Modal>
  );
};

const UserPage: React.FC = () => {
  const { notification, modal } = App.useApp();
  const [form] = Form.useForm<{
    name: string;
    email: string;
    password: string;
    roleId: string;
  }>();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UserBase | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const { data, isLoading, isError } = useUsers({
    page,
    pageSize: LIMIT,
    search,
  });
  const users = data?.data ?? [];
  const total = data?.meta.total ?? 0;

  // Lấy danh sách role cho Select
  const { data: rolesData } = useRoles({ pageSize: 100 });
  const roleOptions = (rolesData?.data ?? []).map((r) => ({
    value: r.id,
    label: r.name,
  }));

  const { mutate: create, isPending: creating } = useCreateUser();
  const { mutate: update, isPending: updating } = useUpdateUser();
  const { mutate: remove } = useDeleteUser();

  const openCreate = () => {
    setEditTarget(null);
    form.resetFields();
    setModalOpen(true);
  };
  const openEdit = (u: UserBase) => {
    setEditTarget(u);
    form.setFieldsValue({
      name: u.name,
      email: u.email,
      roleId: u.role?.id ?? undefined,
    });
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditTarget(null);
    form.resetFields();
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (editTarget) {
        const payload = { ...values };
        update(
          { id: editTarget.id, payload },
          {
            onSuccess: () => {
              notification.success({
                message: "Cập nhật người dùng thành công",
              });
              closeModal();
            },
            onError: () => notification.error({ message: "Cập nhật thất bại" }),
          },
        );
      } else {
        create(values, {
          onSuccess: () => {
            notification.success({ message: "Thêm người dùng thành công" });
            closeModal();
          },
          onError: () => notification.error({ message: "Thêm thất bại" }),
        });
      }
    });
  };

  const handleDelete = (u: UserBase) => {
    modal.confirm({
      title: `Xoá người dùng "${u.name}"?`,
      content: "Hành động này không thể hoàn tác.",
      okText: "Xoá",
      okType: "danger",
      cancelText: "Huỷ",
      onOk: () =>
        remove(u.id, {
          onSuccess: () =>
            notification.success({ message: "Đã xoá người dùng" }),
          onError: () => notification.error({ message: "Xoá thất bại" }),
        }),
    });
  };

  const columns = buildUserColumns({
    page,
    pageSize: LIMIT,
    onDetail: setDetailId,
    onEdit: openEdit,
    onDelete: handleDelete,
  });

  return (
    <div
      style={{
        padding: "24px 32px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <Toolbar
        placeholder="Tìm tên, email…"
        searchInput={searchInput}
        btnTitle="+ Thêm người dùng"
        onSearchInputChange={setSearchInput}
        onSearch={(v) => {
          setSearch(v);
          setPage(1);
        }}
        onClear={() => {
          setSearch("");
          setPage(1);
        }}
        onCreate={openCreate}
      />

      <Table<UserListItem>
        rowKey="id"
        dataSource={users}
        columns={columns}
        loading={isLoading}
        locale={{
          emptyText: isError
            ? "Không thể tải dữ liệu."
            : search
              ? `Không tìm thấy "${search}"`
              : "Chưa có người dùng nào",
        }}
        scroll={{ x: 800 }}
        pagination={{
          current: page,
          pageSize: LIMIT,
          total,
          onChange: setPage,
          showTotal: (t) => `Tổng ${t} người dùng`,
          showSizeChanger: false,
        }}
      />

      <DetailModal
        userId={detailId}
        onClose={() => setDetailId(null)}
        onEdit={openEdit}
      />

      <Modal
        open={modalOpen}
        title={editTarget ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
        okText={editTarget ? "Cập nhật" : "Thêm mới"}
        cancelText="Huỷ"
        confirmLoading={creating || updating}
        onOk={handleSubmit}
        onCancel={closeModal}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="Họ tên"
            rules={[{ required: true, message: "Họ tên không được để trống" }]}
          >
            <Input placeholder="Nhập họ tên…" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Email không được để trống" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input placeholder="Nhập email…" />
          </Form.Item>
          <Form.Item
            name="password"
            label={
              editTarget ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu"
            }
            rules={
              editTarget
                ? []
                : [{ required: true, message: "Mật khẩu không được để trống" }]
            }
          >
            <Input.Password placeholder="Nhập mật khẩu…" />
          </Form.Item>
          <Form.Item name="roleId" label="Quyền">
            <Select
              placeholder="Chọn quyền…"
              allowClear
              options={roleOptions}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserPage;
