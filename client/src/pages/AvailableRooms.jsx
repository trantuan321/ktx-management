import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, formatMoney } from '../api.js';
import {
  Badge,
  EmptyState,
  ErrorBanner,
  Field,
  LoadingBlock,
  PageHeader,
} from '../components/ui.jsx';

export default function AvailableRooms() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [filters, setFilters] = useState({ q: '', buildingId: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/buildings')
      .then((result) => setBuildings(result.buildings))
      .catch(() => setBuildings([]));
  }, []);

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const params = new URLSearchParams({ available: 'true' });
      if (filters.q.trim()) params.set('q', filters.q.trim());
      if (filters.buildingId) params.set('buildingId', filters.buildingId);
      const result = await api(`/rooms?${params.toString()}`);
      setRooms(result.rooms);
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

  return (
    <div>
      <PageHeader
        title="Phòng còn trống"
        subtitle="Tìm phòng phù hợp và gửi đơn đăng ký ở ký túc xá."
      />

      <ErrorBanner message={error} onRetry={load} />

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
            {buildings.map((building) => (
              <option key={building.id} value={building.id}>
                {building.code} · {building.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Tìm kiếm">
          <input
            className="input"
            value={filters.q}
            onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
            placeholder="Mã phòng, tên phòng..."
          />
        </Field>
      </div>

      {loading ? (
        <LoadingBlock />
      ) : rooms.length === 0 ? (
        <div className="card">
          <EmptyState
            icon="search"
            title="Không còn phòng trống"
            description="Hiện tại tất cả các phòng đã đầy hoặc đang bảo trì."
          />
        </div>
      ) : (
        <div className="room-grid">
          {rooms.map((room) => (
            <div className="room-card" key={room.id}>
              <div className="room-card-head">
                <div>
                  <strong>{room.code}</strong>
                  <div className="cell-sub">{room.buildingName}</div>
                </div>
                <Badge variant="success">{room.availableBeds} giường trống</Badge>
              </div>
              <div className="room-card-body">
                <div className="room-meta">
                  <span>Tầng</span>
                  <strong>{room.floor}</strong>
                </div>
                <div className="room-meta">
                  <span>Sức chứa</span>
                  <strong>{room.capacity} người</strong>
                </div>
                <div className="room-meta">
                  <span>Đã ở</span>
                  <strong>
                    {room.occupiedBeds}/{room.capacity}
                  </strong>
                </div>
                <div className="room-meta">
                  <span>Loại phòng</span>
                  <strong>{room.roomType}</strong>
                </div>
                <div className="room-price">{formatMoney(room.pricePerMonth)}/tháng</div>
                <button
                  type="button"
                  className="btn btn-primary btn-block"
                  onClick={() => navigate(`/don-dang-ky?roomId=${room.id}`)}
                >
                  Đăng ký phòng này
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
