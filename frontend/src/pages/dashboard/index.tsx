import { App, Spin, Table, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import type { ColumnsType } from "antd/es/table";

import {
  useDashboardStats,
  useRecentBorrows,
  useTopBooks,
  useTopCategories,
} from "../../hooks/useDashboard";
import { BorrowStatus } from "../../lib/enum/library";
import type { BorrowRecord } from "../../lib/types/book.type";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .slice(-2)
    .join("")
    .toUpperCase();

const BOOK_EMOJIS = ["📗", "📘", "📙", "📕", "📒"];

const STATUS_COLOR: Record<BorrowStatus, string> = {
  [BorrowStatus.BORROWED]: "blue",
  [BorrowStatus.Returned]: "green",
  [BorrowStatus.Overdue]: "red",
};
const STATUS_LABEL: Record<BorrowStatus, string> = {
  [BorrowStatus.BORROWED]: "Đang mượn",
  [BorrowStatus.Returned]: "Đã trả",
  [BorrowStatus.Overdue]: "Quá hạn",
};

const getStatCards = (stats: any) => [
  {
    label: "Tổng sách",
    value: stats.totalBooks,
    icon: "📚",
    cls: "gold",
    sub: "trong hệ thống",
  },
  {
    label: "Người dùng",
    value: stats.totalUsers,
    icon: "◎",
    cls: "violet",
    sub: "tổng tài khoản",
  },
  {
    label: "Tác giả",
    value: stats.totalAuthors,
    icon: "✍",
    cls: "gold",
    sub: "trong hệ thống",
  },
  {
    label: "Danh mục",
    value: stats.totalCategories,
    icon: "⊟",
    cls: "teal",
    sub: "thể loại sách",
  },
  {
    label: "Đang mượn",
    value: stats.totalBorrowed,
    icon: "↗",
    cls: "teal",
    sub: "lượt đang mượn",
  },
  {
    label: "Đã trả tháng này",
    value: stats.returnedThisMonth,
    icon: "✓",
    cls: "violet",
    sub: "lượt trả",
  },
  {
    label: "Quá hạn",
    value: stats.totalOverdue,
    icon: "⚠",
    cls: "rose",
    sub: "cần xử lý",
  },
];

const recentColumns: ColumnsType<BorrowRecord> = [
  {
    title: "Sách",
    key: "book",
    render: (_, r) => (
      <div className="db-table__book">
        <div className="db-table__book-title">{r.book?.title}</div>
        <div className="db-table__book-author">{r.book.author?.name}</div>
      </div>
    ),
  },
  {
    title: "Người mượn",
    key: "user",
    render: (_, r) => (
      <div className="db-table__user">
        <div className="db-table__user-av">{initials(r.user.name)}</div>
        {r.user.name}
      </div>
    ),
  },
  {
    title: "Ngày mượn",
    dataIndex: "borrowDate",
    key: "borrowDate",
    width: 120,
    responsive: ["md"],
    render: (v: string) => <span className="db-table__date">{fmtDate(v)}</span>,
  },
  {
    title: "Hạn trả",
    dataIndex: "dueDate",
    key: "dueDate",
    width: 120,
    responsive: ["lg"],
    render: (v: string) => <span className="db-table__date">{fmtDate(v)}</span>,
  },
  {
    title: "Trạng thái",
    dataIndex: "status",
    key: "status",
    width: 130,
    render: (v: BorrowStatus) => (
      <Tag color={STATUS_COLOR[v]}>{STATUS_LABEL[v]}</Tag>
    ),
  },
];

const DashboardPage = () => {
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: records = [], isLoading: recordsLoading } = useRecentBorrows();
  const { data: topBooks = [] } = useTopBooks();
  const { data: topCategories = [] } = useTopCategories();

  return (
    <App>
      <div className="db-root">
        <div className="db-content">
          {statsLoading ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <Spin />
            </div>
          ) : stats ? (
            <div className="db-stats">
              {getStatCards(stats).map((s, i) => (
                <div className="db-stat" key={i}>
                  <div className="db-stat__top">
                    <span className="db-stat__label">{s.label}</span>
                    <div className={`db-stat__icon db-stat__icon--${s.cls}`}>
                      {s.icon}
                    </div>
                  </div>
                  <div className="db-stat__value">
                    {(s.value ?? 0).toLocaleString()}
                  </div>
                  <div className="db-stat__sub">{s.sub}</div>
                </div>
              ))}
            </div>
          ) : null}

          <div className="db-row">
            <div className="db-section">
              <div className="db-section__header">
                <div>
                  <div className="db-section__title">Lượt mượn gần đây</div>
                  <div className="db-section__subtitle">
                    {records.length} bản ghi
                  </div>
                </div>
                <button
                  className="db-section__action"
                  onClick={() => navigate("/borrow")}
                >
                  Xem tất cả →
                </button>
              </div>

              <Table<BorrowRecord>
                rowKey="id"
                dataSource={records}
                columns={recentColumns}
                loading={recordsLoading}
                pagination={false}
                size="small"
                locale={{ emptyText: "Chưa có lượt mượn nào" }}
                scroll={{ x: 800 }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div className="db-panel">
                <div className="db-panel__header">
                  <div className="db-panel__title">Top sách mượn nhiều</div>
                </div>
                <div className="db-panel__list">
                  {topBooks.map((b, i) => (
                    <div className="db-panel__item" key={b.id}>
                      <span className="db-panel__rank">#{i + 1}</span>
                      <div className="db-panel__cover">
                        {BOOK_EMOJIS[i % BOOK_EMOJIS.length]}
                      </div>
                      <div className="db-panel__info">
                        <div className="db-panel__info-title">{b.title}</div>
                        <div className="db-panel__info-meta">
                          {b.author?.name}
                        </div>
                      </div>
                      <span className="db-panel__count">
                        {b.borrowRecordCount}×
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="db-panel">
                <div className="db-panel__header">
                  <div className="db-panel__title">Danh mục</div>
                </div>
                <div className="db-panel__list">
                  {topCategories.map((c) => (
                    <div className="db-panel__cat" key={c.id}>
                      <span className="db-panel__cat-name">{c.name}</span>
                      <div className="db-panel__cat-bar-wrap">
                        <div
                          className="db-panel__cat-bar"
                          style={{ width: `${c.pct}%` }}
                        />
                      </div>
                      <span className="db-panel__cat-pct">{c.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </App>
  );
};

export default DashboardPage;
