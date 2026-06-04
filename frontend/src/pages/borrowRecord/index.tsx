import { EditOutlined, EyeOutlined } from "@ant-design/icons";
import {
  Typography,
  Tag,
  Modal,
  Space,
  Button,
  Spin,
  Descriptions,
  Table,
  App,
  Form,
  Select,
  DatePicker,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import React, { useState } from "react";

import { Toolbar } from "../../components/ui/toolbar";
import { useBooks } from "../../hooks/useBook";
import { BorrowStatus } from "../../lib/enum/library";
import type { BorrowRecord } from "../../lib/types/book.type";
import { useUsers } from "../../hooks/useUser";
import {
  useBorrowRecord,
  useBorrowRecords,
  useCreateBorrowRecord,
  useUpdateBorrowRecord,
} from "../../hooks/useBorrowRecord";
import dayjs from "dayjs";

const { Text } = Typography;
const LIMIT = 10;

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

const DetailModal: React.FC<{
  recordId: string | null;
  onClose: () => void;
  onEdit: (record: BorrowRecord) => void;
}> = ({ recordId, onClose, onEdit }) => {
  const { data: record, isLoading } = useBorrowRecord(recordId ?? "");

  return (
    <Modal
      open={!!recordId}
      title="Chi tiết phiếu mượn"
      onCancel={onClose}
      width={700}
      destroyOnHidden
      footer={
        <Space>
          <Button onClick={onClose}>Đóng</Button>

          {record && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                onClose();
                onEdit(record);
              }}
            >
              Chỉnh sửa
            </Button>
          )}
        </Space>
      }
    >
      {isLoading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin size="large" />
        </div>
      ) : record ? (
        <Descriptions
          bordered
          column={{
            xs: 1,
            sm: 1,
            md: 2,
            lg: 2,
            xl: 2,
          }}
        >
          <Descriptions.Item label="Người mượn">
            {record.user?.name ?? "—"}
          </Descriptions.Item>

          <Descriptions.Item label="Sách">
            {record.book?.title ?? "—"}
          </Descriptions.Item>

          <Descriptions.Item label="Ngày mượn">
            {new Date(record.borrowDate).toLocaleDateString("vi-VN")}
          </Descriptions.Item>

          <Descriptions.Item label="Hạn trả">
            {new Date(record.dueDate).toLocaleDateString("vi-VN")}
          </Descriptions.Item>

          <Descriptions.Item label="Ngày trả">
            {record.returnDate
              ? new Date(record.returnDate).toLocaleDateString("vi-VN")
              : "Chưa trả"}
          </Descriptions.Item>

          <Descriptions.Item label="Trạng thái">
            <Tag color={STATUS_COLOR[record.status]}>
              {STATUS_LABEL[record.status]}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      ) : null}
    </Modal>
  );
};

interface BorrowFormValues {
  userId: string;
  bookId: string;
  dueDate: dayjs.Dayjs; // DatePicker trả về Dayjs
  status?: BorrowStatus;
  returnDate?: dayjs.Dayjs; // DatePicker trả về Dayjs
}

const BorrowRecordsPage: React.FC = () => {
  const { notification } = App.useApp();
  const [form] = Form.useForm<BorrowFormValues>();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<BorrowRecord | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const { data, isLoading, isError } = useBorrowRecords({
    page,
    pageSize: LIMIT,
    search,
  });
  const borrowRecord = data?.data ?? [];
  const total = data?.meta.total ?? 0;

  // Select options
  const { data: usersData } = useUsers({ pageSize: 200 });
  const { data: booksData } = useBooks({ pageSize: 200 });
  const userOptions = (usersData?.data ?? []).map((_item) => ({
    value: _item.id,
    label: _item.name,
  }));
  const bookOptions = (booksData?.data ?? []).map((_item) => ({
    value: _item.id,
    label: _item.title,
    disabled: _item.quantity <= 0,
  }));

  const { mutate: create, isPending: creating } = useCreateBorrowRecord();
  const { mutate: update, isPending: updating } = useUpdateBorrowRecord();

  const openCreate = () => {
    setEditTarget(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: BorrowRecord) => {
    setEditTarget(record);
    form.setFieldsValue({
      userId: record.userId,
      bookId: record.bookId,
      dueDate: dayjs(record.dueDate),
      status: record.status,
      returnDate: record.returnDate ? dayjs(record.returnDate) : undefined,
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
          {
            id: editTarget.id,
            payload: {
              userId: values.userId,
              bookId: values.bookId,
              dueDate: values.dueDate.toISOString(),
              status: values.status!,
              returnDate: values.returnDate
                ? values.returnDate.toISOString()
                : undefined,
            },
          },
          {
            onSuccess: () => {
              notification.success({
                message: "Cập nhật phiếu mượn sách thành công",
              });
              closeModal();
            },
            onError: () => notification.error({ message: "Cập nhật thất bại" }),
          },
        );
      } else {
        create(
          {
            userId: values.userId,
            bookId: values.bookId,
            dueDate: values.dueDate.toISOString(),
          },
          {
            onSuccess: () => {
              notification.success({
                message: "Thêm phiếu mượn sách thành công",
              });
              closeModal();
            },
            onError: () => notification.error({ message: "Thêm thất bại" }),
          },
        );
      }
    });
  };

  const columns: ColumnsType<BorrowRecord> = [
    {
      title: "#",
      key: "index",
      width: 60,
      render: (_, __, idx) => (page - 1) * LIMIT + idx + 1,
    },
    {
      title: "Sách",
      key: "book",
      width: 160,
      render: (_, r) =>
        r.book ? (
          <Tag color="purple">{r.book.title}</Tag>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
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
            onClick={() => setDetailId(r.id)}
          >
            Chi tiết
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(r)}
          />
          {/* <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r)} /> */}
        </Space>
      ),
    },
  ];

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
        btnTitle="+ Thêm phiếu mượn sách"
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

      <Table<BorrowRecord>
        rowKey="id"
        dataSource={borrowRecord}
        columns={columns}
        loading={isLoading}
        locale={{
          emptyText: isError
            ? "Không thể tải dữ liệu."
            : search
              ? `Không tìm thấy "${search}"`
              : "Chưa có phiếu mượn sách nào",
        }}
        scroll={{ x: 800 }}
        pagination={{
          current: page,
          pageSize: LIMIT,
          total,
          onChange: setPage,
          showTotal: (t) => `Tổng ${t} phiếu mượn sách`,
          showSizeChanger: false,
        }}
      />

      <DetailModal
        recordId={detailId}
        onClose={() => setDetailId(null)}
        onEdit={openEdit}
      />

      <Modal
        open={modalOpen}
        title={
          editTarget ? "Chỉnh sửa phiếu mượn sách" : "Thêm phiếu mượn sách mới"
        }
        okText={editTarget ? "Cập nhật" : "Thêm mới"}
        cancelText="Huỷ"
        confirmLoading={creating || updating}
        onOk={handleSubmit}
        onCancel={closeModal}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="userId"
            label="Người mượn"
            rules={[{ required: true, message: "Vui lòng chọn người mượn" }]}
          >
            <Select
              placeholder="Chọn người mượn..."
              showSearch
              allowClear
              options={userOptions}
              filterOption={(input, option) =>
                (option?.label as string)
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </Form.Item>
          <Form.Item
            name="bookId"
            label="Sách"
            rules={[{ required: true, message: "Vui lòng chọn sách" }]}
          >
            <Select
              placeholder="Chọn sách..."
              showSearch
              allowClear
              options={bookOptions}
              filterOption={(input, option) =>
                (option?.label as string)
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </Form.Item>
          <Form.Item
            name="dueDate"
            label="Hạn trả"
            rules={[{ required: true, message: "Vui lòng chọn hạn trả" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              disabledDate={(current) =>
                current && current <= dayjs().endOf("day")
              }
            />
          </Form.Item>
          {editTarget && (
            <>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn trạng thái",
                  },
                ]}
              >
                <Select
                  options={[
                    {
                      label: "Đang mượn",
                      value: BorrowStatus.BORROWED,
                    },
                    {
                      label: "Đã trả",
                      value: BorrowStatus.Returned,
                    },
                    {
                      label: "Quá hạn",
                      value: BorrowStatus.Overdue,
                      disabled: true,
                    },
                  ]}
                />
              </Form.Item>

              <Form.Item name="returnDate" label="Ngày trả">
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default BorrowRecordsPage;
