import { EditOutlined } from "@ant-design/icons";
import {
  Modal,
  Space,
  Button,
  Spin,
  Descriptions,
  Tag,
  Table,
  Empty,
  Typography,
  Form,
  Input,
  App,
} from "antd";
import React, { useState } from "react";
import {
  useCreateRole,
  useDeleteRole,
  useRole,
  useRoles,
  useUpdateRole,
} from "../../hooks/useRole";
import type {
  RoleBase,
  RoleDetail,
  RoleListItem,
} from "../../lib/types/role.type";
import { Toolbar } from "../../components/ui/toolbar";
import { buildRoleColumns, buildUserColumns } from "./role.columns";
import { useUsersByRoleId } from "../../hooks/useUser";

const { Title, Text } = Typography;
const LIMIT = 10;
const USER_LIMIT = 5;

const DetailModal: React.FC<{
  roleId: string | null;
  onClose: () => void;
  onEdit: (r: RoleDetail) => void;
}> = ({ roleId, onClose, onEdit }) => {
  const [page, setPage] = useState(1);

  const { data: role, isLoading } = useRole(roleId ?? "");
  const { data: user, isLoading: isLoadingUser } = useUsersByRoleId(
    roleId ?? "",
    {
      page,
      pageSize: USER_LIMIT,
      search: "",
    },
  );

  const users = user?.data ?? [];
  const total = user?.meta.total ?? 0;

  return (
    <Modal
      open={!!roleId}
      title="Chi tiết quyền"
      onCancel={onClose}
      width={680}
      destroyOnHidden
      footer={
        <Space>
          <Button onClick={onClose}>Đóng</Button>
          {role && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                onClose();
                onEdit(role);
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
      ) : role ? (
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
            <Descriptions.Item label="Tên quyền" span={2}>
              <Text strong style={{ fontSize: 15 }}>
                {role.name}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Số người dùng">
              <Tag color="blue">{role.userCount} người</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {new Date(role.createdAt).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </Descriptions.Item>
          </Descriptions>

          <div>
            <Title level={5} style={{ marginBottom: 12 }}>
              Người dùng ({users?.length ?? 0})
            </Title>
            {users && users.length > 0 ? (
              <Table
                rowKey="id"
                dataSource={users}
                loading={isLoadingUser}
                columns={buildUserColumns()}
                size="small"
                scroll={{ x: 550, y: 240 }}
                pagination={{
                  current: page,
                  pageSize: USER_LIMIT,
                  total,
                  onChange: (p) => setPage(p),
                  showTotal: (t) => `Tổng ${t} người dùng`,
                  showSizeChanger: false,
                }}
              />
            ) : (
              <Empty
                description="Chưa có người dùng nào"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </div>
        </Space>
      ) : null}
    </Modal>
  );
};

const RolePage: React.FC = () => {
  const { notification, modal } = App.useApp();
  const [form] = Form.useForm<{ name: string }>();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<RoleBase | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const { data, isLoading, isError } = useRoles({
    page,
    pageSize: LIMIT,
    search,
  });
  const roles = data?.data ?? [];
  const total = data?.meta.total ?? 0;

  const { mutate: create, isPending: creating } = useCreateRole();
  const { mutate: update, isPending: updating } = useUpdateRole();
  const { mutate: remove } = useDeleteRole();

  const openCreate = () => {
    setEditTarget(null);
    form.resetFields();
    setModalOpen(true);
  };
  const openEdit = (r: RoleBase) => {
    setEditTarget(r);
    form.setFieldsValue({ name: r.name });
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditTarget(null);
    form.resetFields();
  };

  const handleSubmit = () => {
    form.validateFields().then(({ name }) => {
      if (editTarget) {
        update(
          { id: editTarget.id, payload: { name } },
          {
            onSuccess: () => {
              notification.success({ message: "Cập nhật quyền thành công" });
              closeModal();
            },
            onError: () => notification.error({ message: "Cập nhật thất bại" }),
          },
        );
      } else {
        create(
          { name },
          {
            onSuccess: () => {
              notification.success({ message: "Thêm quyền thành công" });
              closeModal();
            },
            onError: () => notification.error({ message: "Thêm thất bại" }),
          },
        );
      }
    });
  };

  const handleDelete = (r: RoleBase) => {
    modal.confirm({
      title: `Xoá quyền "${r.name}"?`,
      content: "Hành động này không thể hoàn tác.",
      okText: "Xoá",
      okType: "danger",
      cancelText: "Huỷ",
      onOk: () =>
        remove(r.id, {
          onSuccess: () => notification.success({ message: "Đã xoá quyền" }),
          onError: () => notification.error({ message: "Xoá thất bại" }),
        }),
    });
  };

  const columns = buildRoleColumns({
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
        placeholder="Tìm tên quyền…"
        searchInput={searchInput}
        btnTitle="+ Thêm quyền"
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

      <Table<RoleListItem>
        rowKey="id"
        dataSource={roles}
        columns={columns}
        loading={isLoading}
        locale={{
          emptyText: isError
            ? "Không thể tải dữ liệu."
            : search
              ? `Không tìm thấy "${search}"`
              : "Chưa có quyền nào",
        }}
        scroll={{ x: 800 }}
        pagination={{
          current: page,
          pageSize: LIMIT,
          total,
          onChange: setPage,
          showTotal: (t) => `Tổng ${t} quyền`,
          showSizeChanger: false,
        }}
      />

      <DetailModal
        roleId={detailId}
        onClose={() => setDetailId(null)}
        onEdit={openEdit}
      />

      <Modal
        open={modalOpen}
        title={editTarget ? "Chỉnh sửa quyền" : "Thêm quyền mới"}
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
            label="Tên quyền"
            rules={[
              { required: true, message: "Tên quyền không được để trống" },
            ]}
          >
            <Input
              placeholder="Nhập tên quyền…"
              onPressEnter={handleSubmit}
              autoFocus
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RolePage;
