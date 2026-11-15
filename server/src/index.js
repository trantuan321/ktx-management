import { createApp } from './app.js';
import { PORT } from './config.js';
import { seedDatabase } from './seed.js';

const app = createApp();

// Lần chạy đầu tiên: tự sinh dữ liệu mẫu để demo ngay.
const result = seedDatabase();
if (result.seeded) {
  console.log('[seed] Đã tạo dữ liệu mẫu cho lần chạy đầu tiên.');
}

app.listen(PORT, () => {
  console.log(`[QLKTX] API đang chạy tại http://localhost:${PORT}/api`);
});
