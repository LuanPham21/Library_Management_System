import {
  Typography,
  Tag,
  Modal,
  Space,
  Button,
  Spin,
  Descriptions,
  Table,
  Empty,
  App,
  Form,
  Input,
  Select,
  InputNumber,
} from "antd";
import React, { useState } from "react";
import { EditOutlined } from "@ant-design/icons";

import {
  useBook,
  useBooks,
  useCreateBook,
  useUpdateBook,
  useDeleteBook,
} from "../../hooks/useBook";
import type {
  BookDetail,
  BookBase,
  BookListItem,
} from "../../lib/types/book.type";
import { useAuthors } from "../../hooks/useAuthor";
import { Toolbar } from "../../components/ui/toolbar";
import { useCategories } from "../../hooks/useCategory";
import type { BookPayload } from "../../lib/dto/book.dto";
import { buildBookColumns, buildBorrowColumns } from "./book.columns";
import { useBorrowRecordByBookId } from "../../hooks/useBorrowRecord";

const { Title, Text } = Typography;
const LIMIT = 10;
const BORROW_LIMIT = 5;

const DetailModal: React.FC<{
  bookId: string | null;
  onClose: () => void;
  onEdit: (b: BookDetail) => void;
}> = ({ bookId, onClose, onEdit }) => {
  const [page, setPage] = useState(1);

  const { data: book, isLoading } = useBook(bookId ?? "");
  const { data: borrow, isLoading: isLoadingBorrow } = useBorrowRecordByBookId(
    bookId ?? "",
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
      open={!!bookId}
      title="Chi tiết sách"
      onCancel={onClose}
      width={720}
      destroyOnHidden
      footer={
        <Space>
          <Button onClick={onClose}>Đóng</Button>
          {book && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                onClose();
                onEdit(book);
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
      ) : book ? (
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
            <Descriptions.Item label="Tên sách" span={2}>
              <Text strong style={{ fontSize: 15 }}>
                {book.title}
              </Text>
            </Descriptions.Item>
            {book.description && (
              <Descriptions.Item label="Mô tả" span={2}>
                <Text type="secondary">{book.description}</Text>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Tác giả">
              {book.author ? (
                <Tag color="purple">{book.author.name}</Tag>
              ) : (
                <Text type="secondary">—</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Danh mục">
              {book.category ? (
                <Tag color="blue">{book.category.name}</Tag>
              ) : (
                <Text type="secondary">—</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Số lượng">
              <Tag color={book.quantity > 0 ? "green" : "red"}>
                {book.quantity} cuốn
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày thêm">
              {new Date(book.createdAt).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </Descriptions.Item>
          </Descriptions>

          <div>
            <Title level={5} style={{ marginBottom: 12 }}>
              Lịch sử mượn ({borrows.length ?? 0})
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
                description="Chưa có lượt mượn nào"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </div>
        </Space>
      ) : null}
    </Modal>
  );
};

const BookPage: React.FC = () => {
  const { notification, modal } = App.useApp();
  const [form] = Form.useForm<BookPayload>();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<BookBase | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const { data, isLoading, isError } = useBooks({
    page,
    pageSize: LIMIT,
    search,
  });
  const books = data?.data ?? [];
  const total = data?.meta.total ?? 0;

  // Select options
  const { data: authorsData } = useAuthors({ pageSize: 200 });
  const { data: categoriesData } = useCategories({ pageSize: 200 });
  const authorOptions = (authorsData?.data ?? []).map((a) => ({
    value: a.id,
    label: a.name,
  }));
  const categoryOptions = (categoriesData?.data ?? []).map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const { mutate: create, isPending: creating } = useCreateBook();
  const { mutate: update, isPending: updating } = useUpdateBook();
  const { mutate: remove } = useDeleteBook();

  const openCreate = () => {
    setEditTarget(null);
    form.resetFields();
    setModalOpen(true);
  };
  const openEdit = (b: BookBase) => {
    setEditTarget(b);
    form.setFieldsValue({
      title: b.title,
      description: b.description ?? "",
      quantity: b.quantity,
      authorId: b.author?.id ?? undefined,
      categoryId: b.category?.id ?? undefined,
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
        update(
          { id: editTarget.id, payload: values },
          {
            onSuccess: () => {
              notification.success({ message: "Cập nhật sách thành công" });
              closeModal();
            },
            onError: () => notification.error({ message: "Cập nhật thất bại" }),
          },
        );
      } else {
        create(values, {
          onSuccess: () => {
            notification.success({ message: "Thêm sách thành công" });
            closeModal();
          },
          onError: () => notification.error({ message: "Thêm thất bại" }),
        });
      }
    });
  };

  const handleDelete = (b: BookBase) => {
    modal.confirm({
      title: `Xoá sách "${b.title}"?`,
      content: "Hành động này không thể hoàn tác.",
      okText: "Xoá",
      okType: "danger",
      cancelText: "Huỷ",
      onOk: () =>
        remove(b.id, {
          onSuccess: () => notification.success({ message: "Đã xoá sách" }),
          onError: () => notification.error({ message: "Xoá thất bại" }),
        }),
    });
  };

  const columns = buildBookColumns({
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
        placeholder="Tìm tên sách…"
        searchInput={searchInput}
        btnTitle="+ Thêm sách"
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

      <Table<BookListItem>
        rowKey="id"
        dataSource={books}
        columns={columns}
        loading={isLoading}
        locale={{
          emptyText: isError
            ? "Không thể tải dữ liệu."
            : search
              ? `Không tìm thấy "${search}"`
              : "Chưa có sách nào",
        }}
        scroll={{ x: 800 }}
        pagination={{
          current: page,
          pageSize: LIMIT,
          total,
          onChange: setPage,
          showTotal: (t) => `Tổng ${t} sách`,
          showSizeChanger: false,
        }}
      />

      <DetailModal
        bookId={detailId}
        onClose={() => setDetailId(null)}
        onEdit={openEdit}
      />

      <Modal
        open={modalOpen}
        title={editTarget ? "Chỉnh sửa sách" : "Thêm sách mới"}
        okText={editTarget ? "Cập nhật" : "Thêm mới"}
        cancelText="Huỷ"
        confirmLoading={creating || updating}
        onOk={handleSubmit}
        onCancel={closeModal}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="title"
            label="Tên sách"
            rules={[
              { required: true, message: "Tên sách không được để trống" },
            ]}
          >
            <Input placeholder="Nhập tên sách…" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea placeholder="Nhập mô tả…" rows={3} />
          </Form.Item>
          <Space style={{ width: "100%" }} styles={{ item: { flex: 1 } }}>
            <Form.Item name="authorId" label="Tác giả" style={{ flex: 1 }}>
              <Select
                placeholder="Chọn tác giả…"
                allowClear
                showSearch
                filterOption={(input, opt) =>
                  ((opt?.label as string) ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={authorOptions}
              />
            </Form.Item>
            <Form.Item name="categoryId" label="Danh mục" style={{ flex: 1 }}>
              <Select
                placeholder="Chọn danh mục…"
                allowClear
                showSearch
                filterOption={(input, opt) =>
                  ((opt?.label as string) ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={categoryOptions}
              />
            </Form.Item>
          </Space>
          <Form.Item
            name="quantity"
            label="Số lượng"
            rules={[
              { required: true, message: "Số lượng không được để trống" },
            ]}
            initialValue={1}
          >
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              placeholder="Nhập số lượng…"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BookPage;
