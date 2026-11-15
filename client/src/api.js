const TOKEN_KEY = 'ktx_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export async function api(path, { method = 'GET', body } = {}) {
  const token = getToken();
  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    if (res.status === 401 && !path.startsWith('/auth/login')) {
      setToken(null);
      window.dispatchEvent(new Event('auth:logout'));
    }
    throw new Error(data.error || `Yêu cầu thất bại (${res.status}).`);
  }
  return data;
}

export function formatDate(value) {
  if (!value) return '—';
  const normalized = String(value).includes('T') ? value : `${value.replace(' ', 'T')}Z`;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatMoney(value) {
  if (value === null || value === undefined || value === '') return '—';
  return `${Number(value).toLocaleString('vi-VN')} đ`;
}

export function formatGender(value) {
  return { male: 'Nam', female: 'Nữ', mixed: 'Hỗn hợp', other: 'Khác' }[value] || '—';
}

export function formatRoomStatus(value) {
  return (
    { available: 'Đang hoạt động', maintenance: 'Bảo trì', closed: 'Đóng' }[value] || value
  );
}

export function formatBedStatus(value) {
  return (
    { available: 'Trống', occupied: 'Đang ở', maintenance: 'Bảo trì' }[value] || value
  );
}

export function formatApplicationStatus(value) {
  return (
    {
      pending: 'Chờ duyệt',
      approved: 'Đã duyệt',
      rejected: 'Từ chối',
      cancelled: 'Đã hủy',
    }[value] || value
  );
}

export function formatRole(value) {
  return { student: 'Sinh viên', manager: 'Quản lý KTX', admin: 'Quản trị viên' }[value] || value;
}
