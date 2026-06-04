import React, { useState } from "react";
import { EditOutlined } from "@ant-design/icons";
import {
  App,
  Button,
  Descriptions,
  Empty,
  Form,
  Input,
  Modal,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";

import {
  useCategories,
  useCategory,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "../../hooks/useCategory";
import type {
  CategoryBase,
  CategoryDetail,
  CategoryListItem,
} from "../../lib/types/category.type";
import { Toolbar } from "../../components/ui/toolbar";
import { useBooksByCategoryId } from "../../hooks/useBook";
import { buildBookColumns, buildCategoryColumns } from "./category.columns";

const { Title, Text } = Typography;
const LIMIT = 10;
const BOOK_LIMIT = 5;

const DetailModal: React.FC<{
  categoryId: string | null;
  onClose: () => void;
  onEdit: (c: CategoryDetail) => void;
}> = ({ categoryId, onClose, onEdit }) => {
  const [page, setPage] = useState(1);
  const { data: category, isLoading } = useCategory(categoryId ?? "");

  const { data: book, isLoading: isLoadingBook } = useBooksByCategoryId(
    categoryId ?? "",
    {
      page,
      pageSize: BOOK_LIMIT,
      search: "",
    },
  );

  const books = book?.data ?? [];
  const total = book?.meta.total ?? 0;

  return (
    <Modal
      open={!!categoryId}
      title="Chi tiết danh mục"
      onCancel={onClose}
      width={680}
      destroyOnHidden
      footer={
        <Space>
          <Button onClick={onClose}>Đóng</Button>
          {category && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                onClose();
                onEdit(category);
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
      ) : category ? (
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
            <Descriptions.Item label="Tên danh mục" span={2}>
              <Text strong style={{ fontSize: 15 }}>
                {category.name}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Số sách">
              <Tag color="gold">{category.bookCount} sách</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {new Date(category.createdAt).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </Descriptions.Item>
            <Descriptions.Item label="Cập nhật lần cuối" span={2}>
              {new Date(category.updatedAt).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Descriptions.Item>
          </Descriptions>

          <div>
            <Title level={5} style={{ marginBottom: 12 }}>
              Danh sách ({total})
            </Title>
            {books && books.length > 0 ? (
              <Table
                rowKey="id"
                dataSource={books}
                loading={isLoadingBook}
                columns={buildBookColumns()}
                size="small"
                scroll={{ y: 240 }}
                pagination={{
                  current: page,
                  pageSize: BOOK_LIMIT,
                  total,
                  onChange: (p) => setPage(p),
                  showTotal: (t) => `Tổng ${t} sách`,
                  showSizeChanger: false,
                }}
              />
            ) : (
              <Empty
                description="Danh mục chưa có sách nào"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </div>
        </Space>
      ) : null}
    </Modal>
  );
};

const CategoryPage: React.FC = () => {
  const { notification, modal } = App.useApp();
  const [form] = Form.useForm<{ name: string }>();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CategoryBase | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const { data, isLoading, isError } = useCategories({
    page,
    pageSize: LIMIT,
    search,
  });
  const categories = data?.data ?? [];
  const total = data?.meta.total ?? 0;

  const { mutate: create, isPending: creating } = useCreateCategory();
  const { mutate: update, isPending: updating } = useUpdateCategory();
  const { mutate: remove } = useDeleteCategory();

  const openCreate = () => {
    setEditTarget(null);
    form.resetFields();
    setModalOpen(true);
  };
  const openEdit = (c: CategoryBase) => {
    setEditTarget(c);
    form.setFieldsValue({ name: c.name });
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
              notification.success({ message: "Cập nhật danh mục thành công" });
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
              notification.success({ message: "Thêm danh mục thành công" });
              closeModal();
            },
            onError: () => notification.error({ message: "Thêm thất bại" }),
          },
        );
      }
    });
  };

  const handleDelete = (c: CategoryBase) => {
    modal.confirm({
      title: `Xoá danh mục "${c.name}"?`,
      content: "Hành động này không thể hoàn tác.",
      okText: "Xoá",
      okType: "danger",
      cancelText: "Huỷ",
      onOk: () =>
        remove(c.id, {
          onSuccess: () => notification.success({ message: "Đã xoá danh mục" }),
          onError: () => notification.error({ message: "Xoá thất bại" }),
        }),
    });
  };

  const columns = buildCategoryColumns({
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
        placeholder="Tìm tên danh mục…"
        searchInput={searchInput}
        btnTitle="+ Thêm danh mục"
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

      <Table<CategoryListItem>
        rowKey="id"
        dataSource={categories}
        columns={columns}
        loading={isLoading}
        locale={{
          emptyText: isError
            ? "Không thể tải dữ liệu."
            : search
              ? `Không tìm thấy "${search}"`
              : "Chưa có danh mục nào",
        }}
        scroll={{ x: 800 }}
        pagination={{
          current: page,
          pageSize: LIMIT,
          total,
          onChange: setPage,
          showTotal: (t) => `Tổng ${t} danh mục`,
          showSizeChanger: false,
        }}
      />

      <DetailModal
        categoryId={detailId}
        onClose={() => setDetailId(null)}
        onEdit={openEdit}
      />

      <Modal
        open={modalOpen}
        title={editTarget ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
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
            label="Tên danh mục"
            rules={[
              { required: true, message: "Tên danh mục không được để trống" },
            ]}
          >
            <Input
              placeholder="Nhập tên danh mục…"
              onPressEnter={handleSubmit}
              autoFocus
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryPage;
