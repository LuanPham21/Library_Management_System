import React from "react";
import {
  HomeOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { Breadcrumb, Button, Dropdown, Layout, type MenuProps } from "antd";
import { Outlet, useLocation, NavLink, Navigate, Link } from "react-router-dom";

import "./AppLayout.scss";
import { useLogout } from "../hooks/useAuth";
import { NAV_BAR } from "../lib/constants/navbar";
import { authStorage } from "../lib/config/auth.config";
import { useBreadcrumbs } from "../hooks/useBreadcrumb";

import { Drawer, Grid } from "antd";

const AppLayout: React.FC = () => {
  const { useBreakpoint } = Grid;

  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const { Sider } = Layout;
  const [collapsed, setCollapsed] = useState(false);

  const location = useLocation();
  const { mutate: logout } = useLogout();

  if (!authStorage.isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  const pageTitle =
    NAV_BAR.find((n) => n.path === location.pathname)?.label ??
    "Bảng điều kiển";
  const breadcrumbs = useBreadcrumbs(location.pathname);

  const items: MenuProps["items"] = [
    // {
    //   key: "profile",
    //   label: "Thông tin cá nhân",
    //   icon: <UserOutlined />,
    //   onClick: () => navigate("/profile"),
    // },
    // {
    //   type: "divider",
    // },
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: () => {
        logout();
      },
    },
  ];

  return (
    <Layout className="db-root">
      {isMobile ? (
        <Drawer
          placement="left"
          open={!collapsed}
          onClose={() => setCollapsed(true)}
          width={240}
          styles={{
            body: { padding: 0 },
          }}
        >
          <aside className={collapsed ? "collapsed" : ""}>
            <NavLink to={"/"}>
              <div className="db-sidebar__logo">
                <div className="db-sidebar__logo-mark">◈</div>
                <div className="db-sidebar__logo-text">
                  Library
                  <small>Management System</small>
                </div>
              </div>
            </NavLink>

            <nav className="db-sidebar__nav">
              {NAV_BAR.map((item) => (
                <NavLink
                  key={item.key}
                  to={item.path}
                  className={({ isActive }) =>
                    `db-sidebar__link${isActive ? " db-sidebar__link--active" : ""}`
                  }
                >
                  <span className="sidebar__icon">{item.icon}</span>
                  <span className="sidebar__title">{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </aside>
        </Drawer>
      ) : (
        <Sider
          trigger={null}
          className="db-sidebar"
          collapsible
          collapsed={collapsed}
          width={240}
          collapsedWidth={80}
        >
          <aside className={collapsed ? "collapsed" : ""}>
            <NavLink to={"/"}>
              <div className="db-sidebar__logo">
                <div className="db-sidebar__logo-mark">◈</div>
                <div className="db-sidebar__logo-text">
                  Library
                  <small>Management System</small>
                </div>
              </div>
            </NavLink>

            <nav className="db-sidebar__nav">
              {NAV_BAR.map((item) => (
                <NavLink
                  key={item.key}
                  to={item.path}
                  className={({ isActive }) =>
                    `db-sidebar__link${isActive ? " db-sidebar__link--active" : ""}`
                  }
                >
                  <span className="sidebar__icon">{item.icon}</span>
                  <span className="sidebar__title">{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </aside>
        </Sider>
      )}

      <Layout>
        <div className="db-main">
          {/* Topbar */}
          <header className="db-topbar">
            <div className="db-topbar__left">
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  color: "#f4c542",
                  fontSize: "16px",
                  width: 64,
                  height: 64,
                }}
              />
              <div className="db-topbar__left">
                <span className="db-topbar__title">{pageTitle}</span>
              </div>
            </div>
            <div className="db-topbar__right">
              <Dropdown
                menu={{ items }}
                trigger={["click"]}
                placement="bottomRight"
              >
                <Button
                  className="db-topbar__btn"
                  type="text"
                  icon={<UserOutlined />}
                />
              </Dropdown>
            </div>
          </header>

          <section className="library__content">
            {breadcrumbs.length > 0 && (
              <div className="db-breadcrumb">
                <Breadcrumb
                  items={[
                    {
                      title: (
                        <Link to="/">
                          <HomeOutlined /> Trang chủ
                        </Link>
                      ),
                    },
                    ...breadcrumbs.map(({ label, path, isLast }) => ({
                      title: isLast ? label : <Link to={path}>{label}</Link>,
                    })),
                  ]}
                />
              </div>
            )}

            <Outlet />
          </section>
        </div>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
