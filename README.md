# Work Time Calculator — Chrome Extension

> Tính nhanh ngày công và tổng giờ làm việc từ dữ liệu copy từ Excel.

---

## Tính năng

- ✅ Tự đọc clipboard khi mở popup
- ✅ Tự động tính toán nếu dữ liệu hợp lệ
- ✅ Paste thủ công nếu clipboard trống
- ✅ Hiển thị: ngày công, tổng giờ, giờ chuẩn (8h/ngày), dư/thiếu
- ✅ Lưu dữ liệu lần cuối
- ✅ Dark mode tự động theo Chrome theme
- ✅ Ctrl+Enter để tính nhanh

## Định dạng dữ liệu

Mỗi dòng một giá trị `HH:mm`:

```
08:39
07:46
08:20
```

- Dòng không hợp lệ → bỏ qua
- `00:00` → bỏ qua hoàn toàn

---

## Cài đặt (local)

1. Mở `chrome://extensions`
2. Bật **Developer mode** (góc trên phải)
3. Nhấn **Load unpacked**
4. Chọn thư mục `work-time-extension`

---

## Build TypeScript

```bash
npm install
npm run build
```

Để watch (tự build khi lưu file):

```bash
npm run watch
```

---

## Cấu trúc project

```
work-time-extension/
├── manifest.json       # Manifest V3
├── popup.html          # UI popup
├── popup.ts / .js      # Controller
├── popup.css           # Styles (dark mode included)
├── utils/
│   ├── calculator.ts   # Logic tính toán
│   └── calculator.js   # Compiled
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── tsconfig.json
├── package.json
└── README.md
```

---

## Ví dụ kết quả

```
Ngày công:  5
Tổng giờ:   40:37
Giờ chuẩn:  40:00
Dư:        +00:37
```

---

*Made for personal use*
