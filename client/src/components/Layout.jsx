import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { formatRole } from '../api.js';
import { Icon } from './icons.jsx';

const NAV_ITEMS = [
  { section: 'Tổng quan', roles: ['student', 'manager', 'admin'] },
  { to: '/', label: 'Trang chủ', icon: 'home', roles: ['student', 'manager', 'admin'], end: true },

  { section: 'Dành cho sinh viên', roles: ['student'] },
  { to: '/phong-trong', label: 'Phòng trống', icon: 'search', roles: ['student'] },
  { to: '/don-dang-ky', label: 'Đơn đăng ký', icon: 'document', roles: ['student'] },
  { to: '/ho-so', label: 'Hồ sơ của tôi', icon: 'user', roles: ['student'] },

  { section: 'Nghiệp vụ KTX', roles: ['manager', 'admin'] },
  { to: '/toa-nha', label: 'Tòa nhà', icon: 'building', roles: ['manager', 'admin'] },
  { to: '/phong', label: 'Phòng & giường', icon: 'bed', roles: ['manager', 'admin'] },
  { to: '/sinh-vien', label: 'Sinh viên', icon: 'graduation', roles: ['manager', 'admin'] },
  { to: '/don-dang-ky', label: 'Đơn đăng ký', icon: 'clipboard', roles: ['manager', 'admin'] },

  { section: 'Quản trị hệ thống', roles: ['admin'] },
  { to: '/nguoi-dung', label: 'Người dùng', icon: 'users', roles: ['admin'] },
];

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(user.role));
  const current = visibleItems.find(
    (item) => item.to && (item.end ? location.pathname === item.to : location.pathname === item.to),
  );
  const pageTitle = current?.label || 'QLKTX';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-shell">
      {sidebarOpen ? (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      ) : null}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-logo"><Icon name="home" size={22} /></div>
          <div className="brand-text">
            <strong>QLKTX</strong>
            <span>Nhóm 10 · IT3180</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {visibleItems.map((item, index) =>
            item.section ? (
              <div className="nav-section" key={`section-${index}`}>
                {item.section}
              </div>
            ) : (
              <NavLink
                key={`${item.to}-${item.label}`}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">
                  <Icon name={item.icon} size={17} />
                </span>
                <span>{item.label}</span>
              </NavLink>
            ),
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="avatar">{initials(user.fullName)}</div>
            <div className="user-meta">
              <strong>{user.fullName}</strong>
              <span>{formatRole(user.role)}</span>
            </div>
          </div>
          <button type="button" className="btn btn-logout btn-sm btn-block" onClick={handleLogout}>
            <Icon name="logout" size={16} />
            Đăng xuất
          </button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="menu-toggle"
              onClick={() => setSidebarOpen((value) => !value)}
              aria-label="Mở menu"
            >
              ☰
            </button>
            <div>
              <div className="topbar-title">{pageTitle}</div>
              <div className="topbar-sub">Hệ thống Quản lý Ký túc xá</div>
            </div>
          </div>
          <div className="topbar-right">
            <span className="topbar-avatar" title={user.fullName}>
              {initials(user.fullName)}
            </span>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
