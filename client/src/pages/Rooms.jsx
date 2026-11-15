import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  api,
  formatBedStatus,
  formatMoney,
  formatRoomStatus,
} from '../api.js';
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

const EMPTY_ROOM = {
  buildingId: '',
  code: '',
  name: '',
  floor: 1,
  capacity: 4,
  roomType: 'standard',
  pricePerMonth: 0,
  status: 'available',
  description: '',
  bedCount: 4,
};

function roomStatusVariant(status) {
  return { available: 'success', maintenance: 'warning', closed: 'neutral' }[status] || 'neutral';
}

function bedStatusVariant(status) {
  return { available: 'success', occupied: 'danger', maintenance: 'warning' }[status] || 'neutral';
}

export default function Rooms() {
  const [buildings, setBuildings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ buildingId: '', status: '', q: '', available: false });

  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_ROOM);
  const [saving, setSaving] = useState(false);

  const [bedsRoom, setBedsRoom] = useState(null);
  const [beds, setBeds] = useState([]);
  const [bedsLoading, setBedsLoading] = useState(false);
  const [newBedCode, setNewBedCode] = useState('');
  const toast = useToast();

  useEffect(() => {
    api('/buildings')
      .then((result) => setBuildings(result.buildings))
      .catch((err) => setError(err.message));
  }, []);

  const loadRooms = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.buildingId) params.set('buildingId', filters.buildingId);
      if (filters.status) params.set('status', filters.status);
      if (filters.q.trim()) params.set('q', filters.q.trim());
      if (filters.available) params.set('available', 'true');
      const query = params.toString();
      const result = await api(`/rooms${query ? `?${query}` : ''}`);
      setRooms(result.rooms);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = window.setTimeout(loadRooms, 250);
    return () => window.clearTimeout(timer);
  }, [loadRooms]);

  const buildingOptions = useMemo(
    () => buildings.map((building) => ({ id: building.id, label: `${building.code} · ${building.name}` })),
    [buildings],
  );

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_ROOM, buildingId: buildings[0]?.id || '' });
    setRoomModalOpen(true);
  };

  const openEdit = (room) => {
    setEditing(room);
    setForm({
      buildingId: room.buildingId,
      code: room.code,
      name: room.name || '',
      floor: room.floor,
      capacity: room.capacity,
      roomType: room.roomType,
      pricePerMonth: room.pricePerMonth,
      status: room.status,
      description: room.description || '',
      bedCount: room.bedCount,
    });
    setRoomModalOpen(true);
  };

  const handleChange = (key) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    const payload = {
      buildingId: Number(form.buildingId),
      code: form.code.trim(),
      name: form.name.trim(),
      floor: Number(form.floor),
      capacity: Number(form.capacity),
      roomType: form.roomType,
      pricePerMonth: Number(form.pricePerMonth),
      status: form.status,
      description: form.description.trim(),
    };
    if (!editing) payload.bedCount = Number(form.bedCount);
    try {
      if (editing) {
        await api(`/rooms/${editing.id}`, { method: 'PUT', body: payload });
        toast('Đã cập nhật phòng.');
      } else {
        await api('/rooms', { method: 'POST', body: payload });
        toast('Đã thêm phòng và tạo giường.');
      }
      setRoomModalOpen(false);
      await loadRooms();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (room) => {
    if (!window.confirm(`Xóa phòng ${room.code}? Các giường trống trong phòng cũng bị xóa.`)) {
      return;
    }
    try {
      await api(`/rooms/${room.id}`, { method: 'DELETE' });
      toast('Đã xóa phòng.');
      await loadRooms();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const openBeds = async (room) => {
    setBedsRoom(room);
    setBeds([]);
    setNewBedCode('');
    setBedsLoading(true);
    try {
      const result = await api(`/rooms/${room.id}`);
      setBedsRoom(result.room);
      setBeds(result.beds);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBedsLoading(false);
    }
  };

  const reloadBeds = async () => {
    if (!bedsRoom) return;
    const result = await api(`/rooms/${bedsRoom.id}`);
    setBedsRoom(result.room);
    setBeds(result.beds);
    await loadRooms();
  };

  const addBed = async (event) => {
    event.preventDefault();
    if (!newBedCode.trim()) return;
    try {
      await api('/beds', {
        method: 'POST',
        body: { roomId: bedsRoom.id, code: newBedCode.trim() },
      });
      toast('Đã thêm giường.');
      setNewBedCode('');
      await reloadBeds();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const setBedStatus = async (bed, status) => {
    try {
      await api(`/beds/${bed.id}`, { method: 'PUT', body: { status } });
      toast('Đã cập nhật trạng thái giường.');
      await reloadBeds();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const deleteBed = async (bed) => {
    if (!window.confirm(`Xóa giường ${bed.code}?`)) return;
    try {
      await api(`/beds/${bed.id}`, { method: 'DELETE' });
      toast('Đã xóa giường.');
      await reloadBeds();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const availableCount = rooms.filter((room) => room.availableBeds > 0).length;

  return (
    <div>
      <PageHeader
        title="Quản lý phòng & giường"
        subtitle="Thêm/sửa/xóa phòng, giường và theo dõi tình trạng trống/đầy."
        actions={
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            + Thêm phòng
          </button>
        }
      />

      <ErrorBanner message={error} onRetry={loadRooms} />

      <div className="filters">
        <Field label="Tòa nhà">
          <select
            className="select"
            value={filters.buildingId}
            onChange={(event) =>
              setFilters((current) => ({ ...current, buildingId: event.target.value }))
            }
          >
            <option value="">Tất cả tòa</option>
            {buildingOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
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
            <option value="available">Đang hoạt động</option>
            <option value="maintenance">Bảo trì</option>
            <option value="closed">Đóng</option>
          </select>
        </Field>
        <Field label="Tìm kiếm">
          <input
            className="input"
            value={filters.q}
            onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
            placeholder="Mã phòng, tên phòng, tòa..."
          />
        </Field>
        <label className="checkbox" style={{ paddingBottom: 9 }}>
          <input
            type="checkbox"
            checked={filters.available}
            onChange={(event) =>
              setFilters((current) => ({ ...current, available: event.target.checked }))
            }
          />
          Chỉ phòng còn trống
        </label>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Danh sách phòng</h3>
          <span className="pill">
            {rooms.length} phòng · {availableCount} phòng còn trống
          </span>
        </div>
        <div className="card-body flush">
          {loading ? (
            <LoadingBlock />
          ) : rooms.length === 0 ? (
            <EmptyState
              icon="bed"
              title="Không tìm thấy phòng"
              description="Thử đổi bộ lọc hoặc thêm phòng mới."
            />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Tòa</th>
                    <th>Phòng</th>
                    <th>Tầng</th>
                    <th>Sức chứa</th>
                    <th>Đã ở</th>
                    <th>Trống</th>
                    <th>Giá/tháng</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room) => (
                    <tr key={room.id}>
                      <td className="mono">{room.buildingCode}</td>
                      <td>
                        <div className="cell-strong">{room.code}</div>
                        <div className="cell-sub">{room.name}</div>
                      </td>
                      <td>{room.floor}</td>
                      <td>{room.capacity}</td>
                      <td>
                        {room.occupiedBeds}/{room.capacity}
                      </td>
                      <td>
                        <Badge variant={room.availableBeds > 0 ? 'success' : 'danger'}>
                          {room.availableBeds} trống
                        </Badge>
                      </td>
                      <td className="mono">{formatMoney(room.pricePerMonth)}</td>
                      <td>
                        <Badge variant={roomStatusVariant(room.status)}>
                          {formatRoomStatus(room.status)}
                        </Badge>
                      </td>
                      <td>
                        <div className="action-group">
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => openBeds(room)}
                          >
                            Giường
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => openEdit(room)}
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(room)}
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
        open={roomModalOpen}
        title={editing ? `Sửa phòng ${editing.code}` : 'Thêm phòng'}
        onClose={() => setRoomModalOpen(false)}
        width="720px"
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setRoomModalOpen(false)}
            >
              Hủy
            </button>
            <button
              type="submit"
              form="room-form"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </>
        }
      >
        <form id="room-form" className="form-grid" onSubmit={handleSubmit}>
          <Field label="Tòa nhà" required>
            <select
              className="select"
              value={form.buildingId}
              onChange={handleChange('buildingId')}
              required
            >
              <option value="">Chọn tòa nhà</option>
              {buildingOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Mã phòng" required>
            <input
              className="input"
              value={form.code}
              onChange={handleChange('code')}
              placeholder="VD: A101"
              required
            />
          </Field>
          <Field label="Tên phòng">
            <input
              className="input"
              value={form.name}
              onChange={handleChange('name')}
              placeholder="VD: Phòng A101"
            />
          </Field>
          <Field label="Tầng" required>
            <input
              className="input"
              type="number"
              min="1"
              value={form.floor}
              onChange={handleChange('floor')}
              required
            />
          </Field>
          <Field label="Sức chứa" required>
            <input
              className="input"
              type="number"
              min="1"
              value={form.capacity}
              onChange={handleChange('capacity')}
              required
            />
          </Field>
          {!editing ? (
            <Field label="Số giường tạo ban đầu" hint="Mặc định bằng sức chứa.">
              <input
                className="input"
                type="number"
                min="0"
                value={form.bedCount}
                onChange={handleChange('bedCount')}
              />
            </Field>
          ) : null}
          <Field label="Loại phòng">
            <input
              className="input"
              value={form.roomType}
              onChange={handleChange('roomType')}
              placeholder="standard / service"
            />
          </Field>
          <Field label="Giá/tháng (đ)">
            <input
              className="input"
              type="number"
              min="0"
              value={form.pricePerMonth}
              onChange={handleChange('pricePerMonth')}
            />
          </Field>
          <Field label="Trạng thái">
            <select className="select" value={form.status} onChange={handleChange('status')}>
              <option value="available">Đang hoạt động</option>
              <option value="maintenance">Bảo trì</option>
              <option value="closed">Đóng</option>
            </select>
          </Field>
          <div className="span-2">
            <Field label="Mô tả">
              <textarea
                className="textarea"
                value={form.description}
                onChange={handleChange('description')}
                placeholder="Thông tin thêm về phòng..."
              />
            </Field>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(bedsRoom)}
        title={bedsRoom ? `Giường của phòng ${bedsRoom.code}` : 'Giường'}
        onClose={() => setBedsRoom(null)}
        width="720px"
        footer={
          <button type="button" className="btn btn-secondary" onClick={() => setBedsRoom(null)}>
            Đóng
          </button>
        }
      >
        {bedsLoading ? (
          <LoadingBlock label="Đang tải giường..." />
        ) : (
          <>
            <div className="flex-between mb">
              <span className="pill">
                Sức chứa {bedsRoom?.capacity} · hiện có {beds.length} giường
              </span>
              <form className="flex" onSubmit={addBed}>
                <input
                  className="input"
                  value={newBedCode}
                  onChange={(event) => setNewBedCode(event.target.value)}
                  placeholder="Mã giường mới (VD: G5)"
                  style={{ width: 180 }}
                />
                <button type="submit" className="btn btn-primary btn-sm">
                  + Thêm giường
                </button>
              </form>
            </div>

            {beds.length === 0 ? (
              <EmptyState icon="bed" title="Phòng chưa có giường" />
            ) : (
              <div className="bed-list">
                {beds.map((bed) => (
                  <div
                    key={bed.id}
                    className={`bed-item ${bed.status === 'occupied' ? 'occupied' : ''} ${
                      bed.status === 'maintenance' ? 'maintenance' : ''
                    }`}
                  >
                    <div>
                      <div className="bed-code">{bed.code}</div>
                      <Badge variant={bedStatusVariant(bed.status)}>
                        {formatBedStatus(bed.status)}
                      </Badge>
                    </div>
                    <div className="action-group">
                      {bed.status === 'available' ? (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => setBedStatus(bed, 'maintenance')}
                        >
                          Bảo trì
                        </button>
                      ) : null}
                      {bed.status === 'maintenance' ? (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => setBedStatus(bed, 'available')}
                        >
                          Mở lại
                        </button>
                      ) : null}
                      {bed.status !== 'occupied' ? (
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => deleteBed(bed)}
                        >
                          Xóa
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
