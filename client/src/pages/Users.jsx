import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, formatRole } from '../api.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { useToast } from '../components/Toast.jsx';
import {
  Badge,
  EmptyState,
  ErrorBanner,
  Field,
  LoadingBlock,
  Modal,
  PageHeader,
} from '../components/ui.jsx';

const EMPTY_FORM = {
  username: '',
  password: '',
  fullName: '',
  role: 'student',
  email: '',
  phone: '',
  studentId: '',
  isActive: true,
};

function roleVariant(role) {
  return { admin: 'danger', manager: 'primary', student: 'info' }[role] || 'neutral';
}

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState({ role: '', q: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [resetTarget, setResetTarget] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const toast = useToast();

  useEffect(() => {
    api('/students')
      .then((result) => setStudents(result.students))
      .catch(() => setStudents([]));
  }, []);

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.role) params.set('role', filters.role);
      if (filters.q.trim()) params.set('q', filters.q.trim());
      const query = params.toString();
      const result = await api(`/users${query ? `?${query}` : ''}`);
      setUsers(result.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = window.setTimeout(load, 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  const linkedStudentIds = useMemo(() => {
    const map = new Set();
    for (const item of users) {
      if (item.studentId && item.id !== editing?.id) map.add(item.studentId);
    }
    return map;
  }, [users, editing]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      username: item.username,
      password: '',
      fullName: item.fullName,
      role: item.role,
      email: item.email || '',
      phone: item.phone || '',
      studentId: item.studentId || '',
      isActive: item.isActive,
    });
    setModalOpen(true);
  };

  const handleChange = (key) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    const payload = {
      fullName: form.fullName.trim(),
      role: form.role,
      email: form.email.trim(),
      phone: form.phone.trim(),
      studentId: form.role === 'student' && form.studentId ? Number(form.studentId) : null,
      isActive: form.isActive,
    };
    try {
      if (editing) {
        await api(`/users/${editing.id}`, { method: 'PUT', body: payload });
        toast('Đã cập nhật tài khoản.');
      } else {
        await api('/users', {
          method: 'POST',
          body: {
            ...payload,
            username: form.username.trim(),
            password: form.password,
          },
        });
        toast('Đã tạo tài khoản mới.');
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      toast('Mật khẩu mới phải có ít nhất 6 ký tự.', 'error');
      return;
    }
    setSaving(true);
    try {
      await api(`/users/${resetTarget.id}/reset-password`, {
        method: 'POST',
        body: { password: newPassword },
      });
      toast('Đã đặt lại mật khẩu.');
      setResetTarget(null);
      setNewPassword('');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Xóa tài khoản "${item.username}"?`)) return;
    try {
      await api(`/users/${item.id}`, { method: 'DELETE' });
      toast('Đã xóa tài khoản.');
      await load();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  return (
    <div>
      <PageHeader
        title="Quản lý người dùng"
        subtitle="Tạo tài khoản, phân vai trò và liên kết hồ sơ sinh viên."
        actions={
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            + Thêm tài khoản
          </button>
        }
      />

      <ErrorBanner message={error} onRetry={load} />

      <div className="filters">
        <Field label="Vai trò">
          <select
            className="select"
            value={filters.role}
            onChange={(event) =>
              setFilters((current) => ({ ...current, role: event.target.value }))
            }
          >
            <option value="">Tất cả</option>
            <option value="student">Sinh viên</option>
            <option value="manager">Quản lý KTX</option>
            <option value="admin">Quản trị viên</option>
          </select>
        </Field>
        <Field label="Tìm kiếm">
          <input
            className="input"
            value={filters.q}
            onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
            placeholder="Tên đăng nhập, họ tên, MSSV..."
          />
        </Field>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Danh sách tài khoản</h3>
          <span className="pill">{users.length} tài khoản</span>
        </div>
        <div className="card-body flush">
          {loading ? (
            <LoadingBlock />
          ) : users.length === 0 ? (
            <EmptyState icon="users" title="Không có tài khoản" />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Tên đăng nhập</th>
                    <th>Họ tên</th>
                    <th>Vai trò</th>
                    <th>Liên kết sinh viên</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((item) => (
                    <tr key={item.id}>
                      <td className="cell-strong mono">{item.username}</td>
                      <td>{item.fullName}</td>
                      <td>
                        <Badge variant={roleVariant(item.role)}>{formatRole(item.role)}</Badge>
                      </td>
                      <td>
                        {item.studentMssv ? (
                          <>
                            <div className="cell-strong">{item.studentMssv}</div>
                            <div className="cell-sub">{item.studentName}</div>
                          </>
                        ) : (
                          <span className="muted">—</span>
                        )}
                      </td>
                      <td>
                        <Badge variant={item.isActive ? 'success' : 'neutral'}>
                          {item.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                        </Badge>
                      </td>
                      <td>
                        <div className="action-group">
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => openEdit(item)}
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              setResetTarget(item);
                              setNewPassword('');
                            }}
                          >
                            Đặt lại MK
                          </button>
                          {item.id !== currentUser.id ? (
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(item)}
                            >
                              Xóa
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal
        open={modalOpen}
        title={editing ? `Sửa tài khoản ${editing.username}` : 'Thêm tài khoản'}
        onClose={() => setModalOpen(false)}
        width="680px"
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setModalOpen(false)}
            >
              Hủy
            </button>
            <button type="submit" form="user-form" className="btn btn-primary" disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </>
        }
      >
        <form id="user-form" className="form-grid" onSubmit={handleSubmit}>
          <Field label="Tên đăng nhập" required>
            <input
              className="input"
              value={form.username}
              onChange={handleChange('username')}
              placeholder="VD: sv07"
              disabled={Boolean(editing)}
              required
            />
          </Field>
          {!editing ? (
            <Field label="Mật khẩu" required hint="Tối thiểu 6 ký tự.">
              <input
                className="input"
                type="password"
                value={form.password}
                onChange={handleChange('password')}
                placeholder="••••••"
                required
              />
            </Field>
          ) : (
            <Field label="Vai trò">
              <select className="select" value={form.role} onChange={handleChange('role')}>
                <option value="student">Sinh viên</option>
                <option value="manager">Quản lý KTX</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </Field>
          )}
          <Field label="Họ tên" required>
            <input
              className="input"
              value={form.fullName}
              onChange={handleChange('fullName')}
              placeholder="VD: Nguyễn Văn A"
              required
            />
          </Field>
          {!editing ? (
            <Field label="Vai trò">
              <select className="select" value={form.role} onChange={handleChange('role')}>
                <option value="student">Sinh viên</option>
                <option value="manager">Quản lý KTX</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </Field>
          ) : null}
          <Field label="Email">
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              placeholder="VD: a@example.com"
            />
          </Field>
          <Field label="Số điện thoại">
            <input
              className="input"
              value={form.phone}
              onChange={handleChange('phone')}
              placeholder="VD: 0912345678"
            />
          </Field>
          {form.role === 'student' ? (
            <div className="span-2">
              <Field label="Liên kết hồ sơ sinh viên" required>
                <select
                  className="select"
                  value={form.studentId}
                  onChange={handleChange('studentId')}
                  required
                >
                  <option value="">Chọn hồ sơ sinh viên</option>
                  {students.map((student) => (
                    <option
                      key={student.id}
                      value={student.id}
                      disabled={linkedStudentIds.has(student.id)}
                    >
                      {student.mssv} · {student.fullName}
                      {linkedStudentIds.has(student.id) ? ' (đã có tài khoản)' : ''}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          ) : null}
          <div className="span-2">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={handleChange('isActive')}
              />
              Tài khoản đang hoạt động
            </label>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(resetTarget)}
        title={resetTarget ? `Đặt lại mật khẩu cho ${resetTarget.username}` : 'Đặt lại mật khẩu'}
        onClose={() => setResetTarget(null)}
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setResetTarget(null)}
            >
              Hủy
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleResetPassword}
              disabled={saving}
            >
              {saving ? 'Đang lưu...' : 'Đặt lại mật khẩu'}
            </button>
          </>
        }
      >
        <Field label="Mật khẩu mới" required hint="Tối thiểu 6 ký tự.">
          <input
            className="input"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="••••••"
          />
        </Field>
      </Modal>
    </div>
  );
}
