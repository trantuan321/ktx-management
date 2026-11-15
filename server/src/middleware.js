import { db } from './db.js';
import { JWT_SECRET } from './config.js';
import { verifyToken } from './auth.js';
import { forbidden, unauthorized } from './errors.js';
import { userDTO } from './serializers.js';

/**
 * Xác thực Bearer token và nạp lại người dùng từ CSDL.
 * Gắn req.user (DTO) và req.userRow (bản ghi gốc).
 */
export function authenticate(req, _res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(unauthorized());
  }
  const payload = verifyToken(token, JWT_SECRET);
  if (!payload || !payload.sub) {
    return next(unauthorized('Phiên đăng nhập không hợp lệ hoặc đã hết hạn.'));
  }
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.sub);
  if (!row || !row.is_active) {
    return next(unauthorized('Tài khoản không tồn tại hoặc đã bị khóa.'));
  }
  req.userRow = row;
  req.user = userDTO(row);
  return next();
}

/**
 * Chỉ cho phép các vai trò được liệt kê truy cập.
 */
export function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(unauthorized());
    if (!roles.includes(req.user.role)) return next(forbidden());
    return next();
  };
}
