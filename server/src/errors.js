export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.details = details;
  }
}

export const badRequest = (message, details) => new HttpError(400, message, details);
export const unauthorized = (message = 'Bạn cần đăng nhập để thực hiện thao tác này.') =>
  new HttpError(401, message);
export const forbidden = (message = 'Bạn không có quyền thực hiện thao tác này.') =>
  new HttpError(403, message);
export const notFound = (message = 'Không tìm thấy dữ liệu.') => new HttpError(404, message);
export const conflict = (message) => new HttpError(409, message);
