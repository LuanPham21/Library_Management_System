import React, { useState } from "react";
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
import { EditOutlined } from "@ant-design/icons";

import {
  useAuthors,
  useAuthor,
  useCreateAuthor,
  useUpdateAuthor,
  useDeleteAuthor,
} from "../../hooks/useAuthor";
import type {
  AuthorBase,
  AuthorDetail,
  AuthorListItem,
} from "../../lib/types/author.type";
import { Toolbar } from "../../components/ui/toolbar";
import { buildAuthorColumns, buildBookColumns } from "./author.columns";
import { useBooksByAuthorId } from "../../hooks/useBook";

const { Title, Text } = Typography;
const LIMIT = 10;
const BOOK_LIMIT = 5;

const DetailModal: React.FC<{
  authorId: string | null;
  onClose: () => void;
  onEdit: (author: AuthorDetail) => void;
}> = ({ authorId, onClose, onEdit }) => {
  const [page, setPage] = useState(1);

  const { data: author, isLoading } = useAuthor(authorId ?? "");
  const { data: book, isLoading: isLoadingBook } = useBooksByAuthorId(
    authorId ?? "",
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
      open={!!authorId}
      title="Chi tiết tác giả"
      onCancel={onClose}
      width={680}
      footer={
        <Space>
          <Button onClick={onClose}>Đóng</Button>
          {author && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                onClose();
                onEdit(author);
              }}
            >
              Chỉnh sửa
            </Button>
          )}
        </Space>
      }
      destroyOnHidden
    >
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin size="large" />
        </div>
      ) : author ? (
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
            <Descriptions.Item label="Tên tác giả" span={2}>
              <Text strong style={{ fontSize: 15 }}>
                {author.name}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Số sách">
              <Tag color="gold">{author.bookCount} sách</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {new Date(author.createdAt).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </Descriptions.Item>
            <Descriptions.Item label="Cập nhật lần cuối" span={2}>
              {new Date(author.updatedAt).toLocaleDateString("vi-VN", {
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
                description="Tác giả chưa có sách nào"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </div>
        </Space>
      ) : null}
    </Modal>
  );
};

const AuthorPage: React.FC = () => {
  const { notification, modal } = App.useApp();
  const [form] = Form.useForm<{ name: string }>();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AuthorBase | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const { data, isLoading, isError } = useAuthors({
    page,
    pageSize: LIMIT,
    search,
  });
  const authors = data?.data ?? [];
  const total = data?.meta.total ?? 0;

  const { mutate: create, isPending: creating } = useCreateAuthor();
  const { mutate: update, isPending: updating } = useUpdateAuthor();
  const { mutate: remove } = useDeleteAuthor();

  const openCreate = () => {
    setEditTarget(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (author: AuthorBase) => {
    setEditTarget(author);
    form.setFieldsValue({ name: author.name });
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
              notification.success({ message: "Cập nhật tác giả thành công" });
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
              notification.success({ message: "Thêm tác giả thành công" });
              closeModal();
            },
            onError: () => notification.error({ message: "Thêm thất bại" }),
          },
        );
      }
    });
  };

  const handleDelete = (author: AuthorBase) => {
    modal.confirm({
      title: `Xoá tác giả "${author.name}"?`,
      content: "Hành động này không thể hoàn tác.",
      okText: "Xoá",
      okType: "danger",
      cancelText: "Huỷ",
      onOk: () =>
        remove(author.id, {
          onSuccess: () => notification.success({ message: "Đã xoá tác giả" }),
          onError: () => notification.error({ message: "Xoá thất bại" }),
        }),
    });
  };

  const columns = buildAuthorColumns({
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
        placeholder="Tìm tên tác giả…"
        searchInput={searchInput}
        btnTitle="+ Thêm tác giả"
        onSearchInputChange={(value: string) => setSearchInput(value)}
        onSearch={(value: string) => {
          setSearch(value);
          setPage(1);
        }}
        onClear={() => {
          setSearch("");
          setPage(1);
        }}
        onCreate={openCreate}
      />

      <Table<AuthorListItem>
        rowKey="id"
        dataSource={authors}
        columns={columns}
        loading={isLoading}
        locale={{
          emptyText: isError
            ? "Không thể tải dữ liệu, thử lại sau."
            : search
              ? `Không tìm thấy tác giả "${search}"`
              : "Chưa có tác giả nào",
        }}
        scroll={{ x: 800 }}
        pagination={{
          current: page,
          pageSize: LIMIT,
          total,
          onChange: (p) => setPage(p),
          showTotal: (t) => `Tổng ${t} tác giả`,
          showSizeChanger: false,
        }}
      />

      <DetailModal
        authorId={detailId}
        onClose={() => setDetailId(null)}
        onEdit={openEdit}
      />

      <Modal
        open={modalOpen}
        title={editTarget ? "Chỉnh sửa tác giả" : "Thêm tác giả mới"}
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
            label="Tên tác giả"
            rules={[
              { required: true, message: "Tên tác giả không được để trống" },
            ]}
          >
            <Input
              placeholder="Nhập tên tác giả…"
              onPressEnter={handleSubmit}
              autoFocus
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AuthorPage;
