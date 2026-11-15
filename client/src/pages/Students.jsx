import { useCallback, useEffect, useState } from 'react';
import { api, formatGender } from '../api.js';
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
  mssv: '',
  fullName: '',
  gender: 'male',
  dateOfBirth: '',
  className: '',
  faculty: '',
  phone: '',
  email: '',
  address: '',
  status: 'active',
};

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ q: '', className: '', status: '', resident: '' });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.q.trim()) params.set('q', filters.q.trim());
      if (filters.className.trim()) params.set('className', filters.className.trim());
      if (filters.status) params.set('status', filters.status);
      if (filters.resident) params.set('resident', filters.resident);
      const query = params.toString();
      const result = await api(`/students${query ? `?${query}` : ''}`);
      setStudents(result.students);
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

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (student) => {
    setEditing(student);
    setForm({
      mssv: student.mssv,
      fullName: student.fullName,
      gender: student.gender || 'male',
      dateOfBirth: student.dateOfBirth || '',
      className: student.className || '',
      faculty: student.faculty || '',
      phone: student.phone || '',
      email: student.email || '',
      address: student.address || '',
      status: student.status,
    });
    setModalOpen(true);
  };

  const handleChange = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    const payload = {
      mssv: form.mssv.trim(),
      fullName: form.fullName.trim(),
      gender: form.gender || null,
      dateOfBirth: form.dateOfBirth || null,
      className: form.className.trim(),
      faculty: form.faculty.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      status: form.status,
    };
    try {
      if (editing) {
        await api(`/students/${editing.id}`, { method: 'PUT', body: payload });
        toast('Đã cập nhật hồ sơ sinh viên.');
      } else {
        await api('/students', { method: 'POST', body: payload });
        toast('Đã thêm hồ sơ sinh viên.');
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (student) => {
    if (!window.confirm(`Xóa hồ sơ sinh viên ${student.mssv} - ${student.fullName}?`)) return;
    try {
      await api(`/students/${student.id}`, { method: 'DELETE' });
      toast('Đã xóa hồ sơ sinh viên.');
      await load();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  return (
    <div>
      <PageHeader
        title="Quản lý hồ sơ sinh viên"
        subtitle="Thêm, sửa và tra cứu sinh viên theo MSSV, họ tên hoặc lớp."
        actions={
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            + Thêm sinh viên
          </button>
        }
      />

      <ErrorBanner message={error} onRetry={load} />

      <div className="filters">
        <Field label="Tìm kiếm">
          <input
            className="input"
            value={filters.q}
            onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
            placeholder="MSSV, họ tên, lớp..."
          />
        </Field>
        <Field label="Lớp">
          <input
            className="input"
            value={filters.className}
            onChange={(event) =>
              setFilters((current) => ({ ...current, className: event.target.value }))
            }
            placeholder="VD: CNTT01"
          />
        </Field>
        <Field label="Trạng thái">
          <select
            className="select"
            value={filters.status}
            onChange={(event) =>
              setFilters((current) => ({ ...current, status: event.target.value }))
            }
          >
            <option value="">Tất cả</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Ngừng hoạt động</option>
          </select>
        </Field>
        <Field label="Nội trú">
          <select
            className="select"
            value={filters.resident}
            onChange={(event) =>
              setFilters((current) => ({ ...current, resident: event.target.value }))
            }
          >
            <option value="">Tất cả</option>
            <option value="true">Đang nội trú</option>
            <option value="false">Chưa nội trú</option>
          </select>
        </Field>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Danh sách sinh viên</h3>
          <span className="pill">{students.length} hồ sơ</span>
        </div>
        <div className="card-body flush">
          {loading ? (
            <LoadingBlock />
          ) : students.length === 0 ? (
            <EmptyState
              icon="graduation"
              title="Không tìm thấy sinh viên"
              description="Thử đổi từ khóa hoặc thêm hồ sơ mới."
            />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>MSSV</th>
                    <th>Họ tên</th>
                    <th>Lớp</th>
                    <th>Khoa</th>
                    <th>Liên hệ</th>
                    <th>Phòng / giường</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td className="cell-strong mono">{student.mssv}</td>
                      <td>
                        <div className="cell-strong">{student.fullName}</div>
                        <div className="cell-sub">{formatGender(student.gender)}</div>
                      </td>
                      <td>{student.className || '—'}</td>
                      <td className="muted">{student.faculty || '—'}</td>
                      <td>
                        <div>{student.phone || '—'}</div>
                        <div className="cell-sub">{student.email || ''}</div>
                      </td>
                      <td>
                        {student.roomCode ? (
                          <>
                            <div className="cell-strong">{student.roomCode}</div>
                            <div className="cell-sub">
                              {student.buildingName} · giường {student.bedCode}
                            </div>
                          </>
                        ) : (
                          <span className="muted">Chưa xếp chỗ</span>
                        )}
                      </td>
                      <td>
                        <Badge variant={student.status === 'active' ? 'success' : 'neutral'}>
                          {student.status === 'active' ? 'Hoạt động' : 'Ngừng'}
                        </Badge>
                      </td>
                      <td>
                        <div className="action-group">
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => openEdit(student)}
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(student)}
                          >
                            Xóa
                          </button>
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
        title={editing ? `Sửa hồ sơ ${editing.mssv}` : 'Thêm hồ sơ sinh viên'}
        onClose={() => setModalOpen(false)}
        width="720px"
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setModalOpen(false)}
            >
              Hủy
            </button>
            <button
              type="submit"
              form="student-form"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </>
        }
      >
        <form id="student-form" className="form-grid" onSubmit={handleSubmit}>
          <Field label="MSSV" required>
            <input
              className="input"
              value={form.mssv}
              onChange={handleChange('mssv')}
              placeholder="VD: SV007"
              required
            />
          </Field>
          <Field label="Họ tên" required>
            <input
              className="input"
              value={form.fullName}
              onChange={handleChange('fullName')}
              placeholder="VD: Nguyễn Văn A"
              required
            />
          </Field>
          <Field label="Giới tính">
            <select className="select" value={form.gender} onChange={handleChange('gender')}>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </Field>
          <Field label="Ngày sinh">
            <input
              className="input"
              type="date"
              value={form.dateOfBirth}
              onChange={handleChange('dateOfBirth')}
            />
          </Field>
          <Field label="Lớp">
            <input
              className="input"
              value={form.className}
              onChange={handleChange('className')}
              placeholder="VD: CNTT01"
            />
          </Field>
          <Field label="Khoa">
            <input
              className="input"
              value={form.faculty}
              onChange={handleChange('faculty')}
              placeholder="VD: Khoa Công nghệ Thông tin"
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
          <Field label="Email">
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              placeholder="VD: a@example.com"
            />
          </Field>
          <div className="span-2">
            <Field label="Địa chỉ">
              <input
                className="input"
                value={form.address}
                onChange={handleChange('address')}
                placeholder="Quê quán / địa chỉ liên hệ"
              />
            </Field>
          </div>
          <Field label="Trạng thái">
            <select className="select" value={form.status} onChange={handleChange('status')}>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Ngừng hoạt động</option>
            </select>
          </Field>
        </form>
      </Modal>
    </div>
  );
}
