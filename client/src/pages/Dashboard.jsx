import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, formatApplicationStatus, formatDate } from '../api.js';
import { useAuth } from '../auth/AuthContext.jsx';
import {
  Badge,
  EmptyState,
  ErrorBanner,
  LoadingBlock,
  PageHeader,
  ProgressBar,
  StatCard,
} from '../components/ui.jsx';
import { Icon } from '../components/icons.jsx';

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

export default function Dashboard() {
  const { user } = useAuth();
  if (user.role === 'student') return <StudentDashboard />;
  return <ManagerDashboard user={user} />;
}

function ManagerDashboard({ user }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const result = await api('/stats');
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = data?.stats;

  return (
    <div>
      <PageHeader
        title={`Xin chào, ${user.fullName}`}
        subtitle="Tổng quan hoạt động ký túc xá trong kỳ hiện tại."
        actions={
          <>
            <Link className="btn btn-secondary" to="/don-dang-ky">
              Duyệt đơn đăng ký
            </Link>
            <Link className="btn btn-primary" to="/phong">
              Quản lý phòng
            </Link>
          </>
        }
      />

      <ErrorBanner message={error} onRetry={load} />

      {loading && !stats ? (
        <LoadingBlock />
      ) : stats ? (
        <>
          <div className="stat-grid">
            <StatCard
              icon="building"
              label="Tòa nhà"
              value={stats.buildings}
              hint="Đang vận hành"
              tone="primary"
            />
            <StatCard
              icon="door"
              label="Phòng"
              value={stats.rooms}
              hint={`trên ${stats.buildings} tòa nhà`}
              tone="info"
            />
            <StatCard
              icon="bed"
              label="Tổng giường"
              value={stats.beds}
              hint={`tại ${stats.rooms} phòng`}
              tone="primary"
            />
            <StatCard
              icon="graduation"
              label="Sinh viên nội trú"
              value={stats.residents}
              hint={`trên ${stats.students} hồ sơ sinh viên`}
              tone="success"
            />
            <StatCard
              icon="search"
              label="Giường còn trống"
              value={stats.availableBeds}
              hint={`trên ${stats.beds} giường`}
              tone="success"
            />
            <StatCard
              icon="clipboard"
              label="Đơn chờ duyệt"
              value={stats.pendingApplications}
              hint={`Tổng ${stats.approvedApplications} đơn đã duyệt`}
              tone={stats.pendingApplications > 0 ? 'warning' : 'primary'}
            />
          </div>

          <div className="grid-2">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Tỷ lệ lấp đầy</h3>
                <Badge variant="info">{stats.occupancyRate}%</Badge>
              </div>
              <div className="card-body">
                <ProgressBar value={stats.occupancyRate} />
                <div className="detail-list mt">
                  <div className="detail-row">
                    <span>Giường đang ở</span>
                    <span>{stats.occupiedBeds} giường</span>
                  </div>
                  <div className="detail-row">
                    <span>Giường còn trống</span>
                    <span>{stats.availableBeds} giường</span>
                  </div>
                  <div className="detail-row">
                    <span>Giường bảo trì</span>
                    <span>{stats.maintenanceBeds} giường</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Lối tắt nghiệp vụ</h3>
              </div>
              <div className="card-body">
                <div className="grid-2">
                  <Link className="btn btn-secondary btn-block" to="/toa-nha">
                    <Icon name="building" size={16} /> Quản lý tòa nhà
                  </Link>
                  <Link className="btn btn-secondary btn-block" to="/phong">
                    <Icon name="bed" size={16} /> Phòng &amp; giường
                  </Link>
                  <Link className="btn btn-secondary btn-block" to="/sinh-vien">
                    <Icon name="graduation" size={16} /> Hồ sơ sinh viên
                  </Link>
                  <Link className="btn btn-secondary btn-block" to="/don-dang-ky">
                    <Icon name="clipboard" size={16} /> Duyệt đơn đăng ký
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="card mt">
            <div className="card-header">
              <h3 className="card-title">Đơn đăng ký gần đây</h3>
              <Link className="btn btn-ghost btn-sm" to="/don-dang-ky">
                Xem tất cả →
              </Link>
            </div>
            <div className="card-body flush">
              {data.recentApplications.length === 0 ? (
                <EmptyState
                  icon="clipboard"
                  title="Chưa có đơn đăng ký"
                  description="Đơn của sinh viên sẽ xuất hiện tại đây."
                />
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Sinh viên</th>
                        <th>MSSV</th>
                        <th>Phòng mong muốn</th>
                        <th>Ngày gửi</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentApplications.map((row) => (
                        <tr key={row.id}>
                          <td className="cell-strong">{row.studentName}</td>
                          <td className="mono">{row.mssv}</td>
                          <td>{row.preferredRoomCode || '—'}</td>
                          <td>{formatDate(row.createdAt)}</td>
                          <td>
                            <Badge variant={statusVariant(row.status)}>
                              {formatApplicationStatus(row.status)}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function StudentDashboard() {
  const { student, refresh } = useAuth();
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      await refresh();
      const result = await api('/applications');
      setApplications(result.applications || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  useEffect(() => {
    load();
  }, [load]);

  const latest = applications[0];
  const pending = applications.find((item) => item.status === 'pending');

  return (
    <div>
      <PageHeader
        title={`Xin chào, ${student?.fullName || 'bạn'}`}
        subtitle="Thông tin nội trú và đơn đăng ký của bạn."
        actions={
          student?.roomCode ? null : (
            <Link className="btn btn-primary" to="/phong-trong">
              <Icon name="search" size={16} /> Tìm phòng trống
            </Link>
          )
        }
      />

      <ErrorBanner message={error} onRetry={load} />

      {loading && applications.length === 0 ? (
        <LoadingBlock />
      ) : (
        <>
          <div className="stat-grid">
            <StatCard
              icon="door"
              label="Phòng hiện tại"
              value={student?.roomCode || 'Chưa xếp'}
              hint={student?.bedCode ? `Giường ${student.bedCode}` : 'Chưa có giường'}
              tone={student?.roomCode ? 'success' : 'warning'}
            />
            <StatCard
              icon="building"
              label="Tòa nhà"
              value={student?.buildingName || '—'}
              hint={student?.buildingCode ? `Mã tòa ${student.buildingCode}` : 'Chưa xếp chỗ'}
              tone="info"
            />
            <StatCard
              icon="graduation"
              label="MSSV"
              value={student?.mssv || '—'}
              hint={student?.className || ''}
            />
            <StatCard
              icon="clipboard"
              label="Đơn đang chờ của bạn"
              value={pending ? '1' : '0'}
              hint={latest ? `Gần nhất: ${formatApplicationStatus(latest.status)}` : 'Chưa gửi đơn'}
              tone={pending ? 'warning' : 'primary'}
            />
          </div>

          <div className="grid-2">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Đơn đăng ký gần nhất</h3>
                <Link className="btn btn-ghost btn-sm" to="/don-dang-ky">
                  Quản lý đơn →
                </Link>
              </div>
              <div className="card-body">
                {latest ? (
                  <div className="detail-list">
                    <div className="detail-row">
                      <span>Trạng thái</span>
                      <span>
                        <Badge variant={statusVariant(latest.status)}>
                          {formatApplicationStatus(latest.status)}
                        </Badge>
                      </span>
                    </div>
                    <div className="detail-row">
                      <span>Phòng mong muốn</span>
                      <span>{latest.preferredRoomCode || 'Không chỉ định'}</span>
                    </div>
                    <div className="detail-row">
                      <span>Ngày gửi</span>
                      <span>{formatDate(latest.createdAt)}</span>
                    </div>
                    <div className="detail-row">
                      <span>Ghi chú duyệt</span>
                      <span>{latest.reviewNote || '—'}</span>
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    icon="document"
                    title="Bạn chưa gửi đơn đăng ký"
                    description="Chọn phòng trống và gửi đơn để được xếp chỗ."
                  />
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Lối tắt</h3>
              </div>
              <div className="card-body">
                <div className="shortcut-grid">
                  <Link className="btn btn-secondary btn-block" to="/phong-trong">
                    <Icon name="search" size={16} /> Phòng trống
                  </Link>
                  <Link className="btn btn-secondary btn-block" to="/don-dang-ky">
                    <Icon name="document" size={16} /> Đơn đăng ký
                  </Link>
                  <Link className="btn btn-secondary btn-block" to="/ho-so">
                    <Icon name="user" size={16} /> Hồ sơ
                  </Link>
                </div>
                {student?.roomCode ? (
                  <div className="alert alert-success mt">
                    <span>
                      Bạn đang ở phòng <strong>{student.roomCode}</strong>
                      {student.bedCode ? (
                        <>
                          {' '}
                          · giường <strong>{student.bedCode}</strong>
                        </>
                      ) : null}{' '}
                      tại <strong>{student.buildingName}</strong>.
                    </span>
                  </div>
                ) : (
                  <div className="alert alert-warning mt">
                    <span>Bạn chưa được xếp chỗ. Hãy gửi đơn đăng ký ở ký túc xá.</span>
                  </div>
                )}
                <p className="card-note">
                  Cần chuyển phòng? Gửi đơn mới tại mục <strong>Đơn đăng ký</strong>.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
