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
  code: '',
  name: '',
  address: '',
  gender: 'mixed',
  floors: 1,
  description: '',
};

function genderVariant(gender) {
  return { male: 'info', female: 'danger', mixed: 'neutral' }[gender] || 'neutral';
}

export default function Buildings() {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const result = await api('/buildings');
      setBuildings(result.buildings);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (building) => {
    setEditing(building);
    setForm({
      code: building.code,
      name: building.name,
      address: building.address || '',
      gender: building.gender,
      floors: building.floors,
      description: building.description || '',
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
      code: form.code.trim(),
      name: form.name.trim(),
      address: form.address.trim(),
      gender: form.gender,
      floors: Number(form.floors),
      description: form.description.trim(),
    };
    try {
      if (editing) {
        await api(`/buildings/${editing.id}`, { method: 'PUT', body: payload });
        toast('Đã cập nhật tòa nhà.');
      } else {
        await api('/buildings', { method: 'POST', body: payload });
        toast('Đã thêm tòa nhà mới.');
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (building) => {
    if (!window.confirm(`Xóa tòa nhà "${building.name}"? Các phòng/giường bên trong cũng bị xóa.`)) {
      return;
    }
    try {
      await api(`/buildings/${building.id}`, { method: 'DELETE' });
      toast('Đã xóa tòa nhà.');
      await load();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  return (
    <div>
      <PageHeader
        title="Quản lý tòa nhà"
        subtitle="Thêm, sửa, xóa tòa nhà và theo dõi số phòng trong từng tòa."
        actions={
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            + Thêm tòa nhà
          </button>
        }
      />

      <ErrorBanner message={error} onRetry={load} />

      <div className="card">
        <div className="card-body flush">
          {loading ? (
            <LoadingBlock />
          ) : buildings.length === 0 ? (
            <EmptyState
              icon="building"
              title="Chưa có tòa nhà"
              description="Bấm “Thêm tòa nhà” để bắt đầu thiết lập ký túc xá."
            />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Mã</th>
                    <th>Tên tòa nhà</th>
                    <th>Giới tính</th>
                    <th>Số tầng</th>
                    <th>Số phòng</th>
                    <th>Địa chỉ</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {buildings.map((building) => (
                    <tr key={building.id}>
                      <td className="cell-strong mono">{building.code}</td>
                      <td>{building.name}</td>
                      <td>
                        <Badge variant={genderVariant(building.gender)}>
                          {formatGender(building.gender)}
                        </Badge>
                      </td>
                      <td>{building.floors}</td>
                      <td>{building.roomsCount}</td>
                      <td className="muted">{building.address || '—'}</td>
                      <td>
                        <div className="action-group">
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => openEdit(building)}
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(building)}
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
        title={editing ? `Sửa tòa nhà ${editing.code}` : 'Thêm tòa nhà'}
        onClose={() => setModalOpen(false)}
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
              form="building-form"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </>
        }
      >
        <form id="building-form" className="form-grid" onSubmit={handleSubmit}>
          <Field label="Mã tòa nhà" required>
            <input
              className="input"
              value={form.code}
              onChange={handleChange('code')}
              placeholder="VD: A"
              required
            />
          </Field>
          <Field label="Tên tòa nhà" required>
            <input
              className="input"
              value={form.name}
              onChange={handleChange('name')}
              placeholder="VD: Tòa nhà A"
              required
            />
          </Field>
          <Field label="Giới tính">
            <select className="select" value={form.gender} onChange={handleChange('gender')}>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="mixed">Hỗn hợp</option>
            </select>
          </Field>
          <Field label="Số tầng" required>
            <input
              className="input"
              type="number"
              min="1"
              value={form.floors}
              onChange={handleChange('floors')}
              required
            />
          </Field>
          <div className="span-2">
            <Field label="Địa chỉ">
              <input
                className="input"
                value={form.address}
                onChange={handleChange('address')}
                placeholder="VD: Khu nội trú số 1"
              />
            </Field>
          </div>
          <div className="span-2">
            <Field label="Mô tả">
              <textarea
                className="textarea"
                value={form.description}
                onChange={handleChange('description')}
                placeholder="Thông tin thêm về tòa nhà..."
              />
            </Field>
          </div>
        </form>
      </Modal>
    </div>
  );
}
