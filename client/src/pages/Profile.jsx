import { formatGender } from '../api.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { Badge, EmptyState, PageHeader } from '../components/ui.jsx';

export default function Profile() {
  const { student } = useAuth();

  if (!student) {
    return (
      <div>
        <PageHeader title="Hồ sơ của tôi" subtitle="Thông tin cá nhân và nơi ở hiện tại." />
        <div className="card">
          <EmptyState
            icon="user"
            title="Tài khoản chưa liên kết hồ sơ sinh viên"
            description="Vui lòng liên hệ quản trị viên để được liên kết hồ sơ."
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Hồ sơ của tôi"
        subtitle="Thông tin cá nhân và tình trạng nội trú của bạn."
      />

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Thông tin cá nhân</h3>
            <Badge variant={student.status === 'active' ? 'success' : 'neutral'}>
              {student.status === 'active' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
            </Badge>
          </div>
          <div className="card-body">
            <div className="detail-list">
              <div className="detail-row">
                <span>MSSV</span>
                <span className="mono">{student.mssv}</span>
              </div>
              <div className="detail-row">
                <span>Họ tên</span>
                <span>{student.fullName}</span>
              </div>
              <div className="detail-row">
                <span>Giới tính</span>
                <span>{formatGender(student.gender)}</span>
              </div>
              <div className="detail-row">
                <span>Ngày sinh</span>
                <span>{student.dateOfBirth || '—'}</span>
              </div>
              <div className="detail-row">
                <span>Lớp</span>
                <span>{student.className || '—'}</span>
              </div>
              <div className="detail-row">
                <span>Khoa</span>
                <span>{student.faculty || '—'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Liên hệ & nơi ở</h3>
          </div>
          <div className="card-body">
            <div className="detail-list">
              <div className="detail-row">
                <span>Số điện thoại</span>
                <span>{student.phone || '—'}</span>
              </div>
              <div className="detail-row">
                <span>Email</span>
                <span>{student.email || '—'}</span>
              </div>
              <div className="detail-row">
                <span>Địa chỉ</span>
                <span>{student.address || '—'}</span>
              </div>
              <div className="detail-row">
                <span>Tòa nhà</span>
                <span>{student.buildingName || 'Chưa xếp chỗ'}</span>
              </div>
              <div className="detail-row">
                <span>Phòng</span>
                <span>{student.roomCode || '—'}</span>
              </div>
              <div className="detail-row">
                <span>Giường</span>
                <span>{student.bedCode || '—'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
