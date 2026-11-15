import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  api,
  formatApplicationStatus,
  formatDate,
} from '../api.js';
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

function statusVariant(status) {
  return (
    {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
      cancelled: 'neutral',
    }[status] || 'neutral'
  );
}

export default function Applications() {
  const { user } = useAuth();
  return user.role === 'student' ? <StudentApplications /> : <ManagerApplications />;
}

/* ------------------------------------------------------------------ */
/* Quản lý duyệt đơn                                                   */
/* ------------------------------------------------------------------ */
function ManagerApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ status: '', q: '' });
  const toast = useToast();

  const [approveTarget, setApproveTarget] = useState(null);
  const [approveRooms, setApproveRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [beds, setBeds] = useState([]);
  const [bedsLoading, setBedsLoading] = useState(false);
  const [selectedBedId, setSelectedBedId] = useState('');
  const [approveNote, setApproveNote] = useState('');
  const [saving, setSaving] = useState(false);

  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectNote, setRejectNote] = useState('');

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.q.trim()) params.set('q', filters.q.trim());
      const query = params.toString();
      const result = await api(`/applications${query ? `?${query}` : ''}`);
      setApplications(result.applications);
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

  const loadBeds = async (roomId) => {
    if (!roomId) {
      setBeds([]);
      setSelectedBedId('');
      return;
    }
    setBedsLoading(true);
    try {
      const result = await api(`/beds?roomId=${roomId}&status=available`);
      setBeds(result.beds);
      setSelectedBedId(result.beds[0]?.id || '');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBedsLoading(false);
    }
  };

  const openApprove = async (application) => {
    setApproveTarget(application);
    setApproveNote('');
    setSelectedBedId('');
    setBeds([]);
    try {
      const result = await api('/rooms?available=true');
      setApproveRooms(result.rooms);
      const preferred = result.rooms.find((room) => room.id === application.preferredRoomId);
      const roomId = preferred?.id || result.rooms[0]?.id || '';
      setSelectedRoomId(roomId);
      await loadBeds(roomId);
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const handleRoomChange = async (event) => {
    const roomId = event.target.value;
    setSelectedRoomId(roomId);
    await loadBeds(roomId);
  };

  const handleApprove = async () => {
    if (!selectedBedId) {
      toast('Vui lòng chọn giường để xếp chỗ.', 'error');
      return;
    }
    setSaving(true);
    try {
      await api(`/applications/${approveTarget.id}/approve`, {
        method: 'POST',
        body: { bedId: Number(selectedBedId), reviewNote: approveNote.trim() },
      });
      toast('Đã duyệt đơn và xếp chỗ cho sinh viên.');
      setApproveTarget(null);
      await load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    setSaving(true);
    try {
      await api(`/applications/${rejectTarget.id}/reject`, {
        method: 'POST',
        body: { reviewNote: rejectNote.trim() },
      });
      toast('Đã từ chối đơn đăng ký.');
      setRejectTarget(null);
      setRejectNote('');
      await load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const pendingCount = applications.filter((item) => item.status === 'pending').length;

  return (
    <div>
      <PageHeader
        title="Quản lý đơn đăng ký"
        subtitle="Duyệt đơn, chọn giường và xếp chỗ cho sinh viên."
      />

      <ErrorBanner message={error} onRetry={load} />

      <div className="filters">
        <Field label="Trạng thái">
          <select
            className="select"
            value={filters.status}
            onChange={(event) =>
              setFilters((current) => ({ ...current, status: event.target.value }))
            }
          >
            <option value="">Tất cả</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </Field>
        <Field label="Tìm kiếm sinh viên">
          <input
            className="input"
            value={filters.q}
            onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
            placeholder="MSSV, họ tên, lớp..."
          />
        </Field>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Danh sách đơn</h3>
          <span className="pill">
            {applications.length} đơn · {pendingCount} chờ duyệt
          </span>
        </div>
        <div className="card-body flush">
          {loading ? (
            <LoadingBlock />
          ) : applications.length === 0 ? (
            <EmptyState
              icon="document"
              title="Không có đơn đăng ký"
              description="Đơn của sinh viên sẽ xuất hiện tại đây."
            />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Sinh viên</th>
                    <th>Phòng mong muốn</th>
                    <th>Ngày gửi</th>
                    <th>Trạng thái</th>
                    <th>Xếp chỗ</th>
                    <th>Ghi chú duyệt</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((application) => (
                    <tr key={application.id}>
                      <td>
                        <div className="cell-strong">{application.studentName}</div>
                        <div className="cell-sub">
                          {application.mssv} · {application.className || '—'}
                        </div>
                      </td>
                      <td>{application.preferredRoomCode || 'Không chỉ định'}</td>
                      <td>{formatDate(application.createdAt)}</td>
                      <td>
                        <Badge variant={statusVariant(application.status)}>
                          {formatApplicationStatus(application.status)}
                        </Badge>
                      </td>
                      <td>
                        {application.assignedRoomCode ? (
                          <>
                            <div className="cell-strong">
                              {application.assignedRoomCode} · {application.assignedBedCode}
                            </div>
                            <div className="cell-sub">{application.assignedBuildingName}</div>
                          </>
                        ) : (
                          <span className="muted">—</span>
                        )}
                      </td>
                      <td className="muted">{application.reviewNote || '—'}</td>
                      <td>
                        {application.status === 'pending' ? (
                          <div className="action-group">
                            <button
                              type="button"
                              className="btn btn-success btn-sm"
                              onClick={() => openApprove(application)}
                            >
                              Duyệt
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => {
                                setRejectTarget(application);
                                setRejectNote('');
                              }}
                            >
                              Từ chối
                            </button>
                          </div>
                        ) : (
                          <span className="muted">Đã xử lý</span>
                        )}
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
        open={Boolean(approveTarget)}
        title={
          approveTarget
            ? `Duyệt đơn của ${approveTarget.studentName} (${approveTarget.mssv})`
            : 'Duyệt đơn'
        }
        onClose={() => setApproveTarget(null)}
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setApproveTarget(null)}
            >
              Hủy
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={handleApprove}
              disabled={saving || !selectedBedId}
            >
              {saving ? 'Đang xử lý...' : 'Duyệt & xếp chỗ'}
            </button>
          </>
        }
      >
        {approveTarget ? (
          <div className="grid-2">
            <div className="detail-list">
              <div className="detail-row">
                <span>Sinh viên</span>
                <span>{approveTarget.studentName}</span>
              </div>
              <div className="detail-row">
                <span>MSSV / Lớp</span>
                <span>
                  {approveTarget.mssv} · {approveTarget.className || '—'}
                </span>
              </div>
              <div className="detail-row">
                <span>Phòng mong muốn</span>
                <span>{approveTarget.preferredRoomCode || 'Không chỉ định'}</span>
              </div>
              <div className="detail-row">
                <span>Ghi chú của SV</span>
                <span>{approveTarget.note || '—'}</span>
              </div>
            </div>

            <div>
              <Field label="Chọn phòng" required>
                <select
                  className="select"
                  value={selectedRoomId}
                  onChange={handleRoomChange}
                >
                  <option value="">Chọn phòng còn trống</option>
                  {approveRooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.buildingCode} · {room.code} ({room.availableBeds} giường trống)
                    </option>
                  ))}
                </select>
              </Field>

              <div className="mt">
                <Field label="Chọn giường" required>
                  {bedsLoading ? (
                    <LoadingBlock label="Đang tải giường..." />
                  ) : (
                    <select
                      className="select"
                      value={selectedBedId}
                      onChange={(event) => setSelectedBedId(event.target.value)}
                    >
                      <option value="">Chọn giường trống</option>
                      {beds.map((bed) => (
                        <option key={bed.id} value={bed.id}>
                          {bed.roomCode} · {bed.code}
                        </option>
                      ))}
                    </select>
                  )}
                </Field>
              </div>

              <div className="mt">
                <Field label="Ghi chú duyệt">
                  <textarea
                    className="textarea"
                    value={approveNote}
                    onChange={(event) => setApproveNote(event.target.value)}
                    placeholder="VD: Đã kiểm tra phòng và xếp chỗ."
                  />
                </Field>
              </div>

              {!bedsLoading && selectedRoomId && beds.length === 0 ? (
                <div className="alert alert-warning">
                  Phòng này hiện không còn giường trống. Hãy chọn phòng khác.
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(rejectTarget)}
        title={
          rejectTarget
            ? `Từ chối đơn của ${rejectTarget.studentName} (${rejectTarget.mssv})`
            : 'Từ chối đơn'
        }
        onClose={() => setRejectTarget(null)}
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setRejectTarget(null)}
            >
              Hủy
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleReject}
              disabled={saving}
            >
              {saving ? 'Đang xử lý...' : 'Xác nhận từ chối'}
            </button>
          </>
        }
      >
        <Field label="Lý do từ chối">
          <textarea
            className="textarea"
            value={rejectNote}
            onChange={(event) => setRejectNote(event.target.value)}
            placeholder="VD: Hết giường trống trong khu vực đăng ký."
          />
        </Field>
      </Modal>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sinh viên gửi / theo dõi đơn                                        */
/* ------------------------------------------------------------------ */
function StudentApplications() {
  const { student, refresh } = useAuth();
  const [searchParams] = useSearchParams();
  const toast = useToast();

  const [applications, setApplications] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    preferredRoomId: searchParams.get('roomId') || '',
    note: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const [applicationResult, roomResult] = await Promise.all([
        api('/applications'),
        api('/rooms?available=true'),
      ]);
      setApplications(applicationResult.applications);
      setRooms(roomResult.rooms);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const hasPending = applications.some((item) => item.status === 'pending');
  const isResident = Boolean(student?.roomCode);
  const canApply = !hasPending && !isResident;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await api('/applications', {
        method: 'POST',
        body: {
          preferredRoomId: form.preferredRoomId ? Number(form.preferredRoomId) : null,
          note: form.note.trim(),
        },
      });
      toast('Đã gửi đơn đăng ký. Vui lòng chờ quản lý duyệt.');
      setForm({ preferredRoomId: '', note: '' });
      await refresh();
      await load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (application) => {
    if (!window.confirm('Hủy đơn đăng ký này?')) return;
    try {
      await api(`/applications/${application.id}/cancel`, { method: 'POST' });
      toast('Đã hủy đơn đăng ký.');
      await load();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  return (
    <div>
      <PageHeader
        title="Đơn đăng ký ở KTX"
        subtitle="Gửi đơn đăng ký và theo dõi trạng thái xếp chỗ của bạn."
      />

      <ErrorBanner message={error} onRetry={load} />

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Gửi đơn đăng ký</h3>
          </div>
          <div className="card-body">
            {isResident ? (
              <div className="alert alert-success">
                Bạn đã được xếp chỗ tại phòng <strong>{student.roomCode}</strong>
                {student.bedCode ? ` · giường ${student.bedCode}` : ''} (
                {student.buildingName}). Không cần gửi thêm đơn.
              </div>
            ) : hasPending ? (
              <div className="alert alert-warning">
                Bạn đang có một đơn chờ duyệt. Vui lòng chờ quản lý xử lý.
              </div>
            ) : null}

            <form className="form-grid" onSubmit={handleSubmit}>
              <div className="span-2">
                <Field label="Phòng mong muốn" hint="Có thể để trống để quản lý tự sắp xếp.">
                  <select
                    className="select"
                    value={form.preferredRoomId}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, preferredRoomId: event.target.value }))
                    }
                    disabled={!canApply}
                  >
                    <option value="">Không chỉ định</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.buildingCode} · {room.code} — còn {room.availableBeds} giường
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="span-2">
                <Field label="Ghi chú">
                  <textarea
                    className="textarea"
                    value={form.note}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, note: event.target.value }))
                    }
                    placeholder="Nguyện vọng về phòng, bạn cùng phòng..."
                    disabled={!canApply}
                  />
                </Field>
              </div>
              <div className="span-2 form-actions">
                <button type="submit" className="btn btn-primary" disabled={!canApply || submitting}>
                  {submitting ? 'Đang gửi...' : 'Gửi đơn đăng ký'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Đơn của tôi</h3>
            <span className="pill">{applications.length} đơn</span>
          </div>
          <div className="card-body flush">
            {loading ? (
              <LoadingBlock />
            ) : applications.length === 0 ? (
              <EmptyState
                icon="document"
                title="Chưa có đơn đăng ký"
                description="Gửi đơn để được xếp chỗ tại ký túc xá."
              />
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Phòng mong muốn</th>
                      <th>Ngày gửi</th>
                      <th>Trạng thái</th>
                      <th>Xếp chỗ</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((application) => (
                      <tr key={application.id}>
                        <td>{application.preferredRoomCode || 'Không chỉ định'}</td>
                        <td>{formatDate(application.createdAt)}</td>
                        <td>
                          <Badge variant={statusVariant(application.status)}>
                            {formatApplicationStatus(application.status)}
                          </Badge>
                        </td>
                        <td>
                          {application.assignedRoomCode ? (
                            <span className="cell-strong">
                              {application.assignedRoomCode} · {application.assignedBedCode}
                            </span>
                          ) : (
                            <span className="muted">—</span>
                          )}
                        </td>
                        <td>
                          {application.status === 'pending' ? (
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => handleCancel(application)}
                            >
                              Hủy đơn
                            </button>
                          ) : (
                            <span className="muted">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
