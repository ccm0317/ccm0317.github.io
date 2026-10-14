# 張哲銘 Chang Che-Ming — 個人履歷網站

網址：https://ccm0317.github.io/

## 檔案結構

| 路徑 | 用途 |
|---|---|
| `index.html` | 頁面內容（依區段以註解分隔：Hero、01–04、頁尾、彈窗） |
| `style.css` | 樣式（開頭有目錄；依頁面區段分組，各區段內含對應的響應式設定） |
| `main.js` | 互動：進場動畫、文件彈窗、導覽列、關鍵數據卡 |
| `public/` | 圖片與 PDF，建置時原樣複製到網站根目錄 |
| `resume-source/resume.html` | 一頁式履歷原始檔（改字後重新輸出 `public/Chang_Che-Ming_Resume.pdf`） |

## 本機預覽與建置

```bash
npm install
npm run dev      # 本機預覽 http://localhost:5173
npm run build    # 輸出到 dist/
```

## 上架

- `source` 分支：本資料夾的原始碼
- `main` 分支：`npm run build` 產生的 `dist/` 內容（GitHub Pages 直接發布此分支）

外部資源：Google Fonts（Cinzel、Noto Sans TC、Noto Serif TC）、GSAP 3.12.2（cdnjs）。
