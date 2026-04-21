# SelfQuiz - Hệ thống Ôn tập Trắc nghiệm Cá nhân

Ứng dụng web giúp người dùng tạo, quản lý và thực hiện các bài kiểm tra trắc nghiệm ngẫu nhiên từ bộ dữ liệu câu hỏi tự soạn.

## Tech Stack

| Component | Technology |
|---|---|
| **Backend** | Spring Boot 3.x (Java 17+) |
| **Database** | H2 (dev) / SQL Server (prod) |
| **Frontend** | React 18 + Vite |
| **ORM** | Spring Data JPA + Hibernate |

## Project Structure

```
SelfQuiz/
├── docs/                    # Tài liệu đặc tả (SRS)
├── selfquiz-backend/        # Spring Boot REST API
└── selfquiz-frontend/       # React SPA
```

## Features (Giai đoạn 1 - MVP)

- ✅ CRUD Môn học (Subjects) & Bộ đề (Decks)
- ✅ CRUD Câu hỏi trắc nghiệm (hỗ trợ Markdown)
- ✅ Làm bài test ngẫu nhiên với xáo trộn đáp án
- ✅ Chấm điểm tự động + giải thích câu sai
- ✅ Lịch sử làm bài
- ✅ Soft Delete (xóa mềm, khôi phục được)

## Getting Started

### Prerequisites
- Java 17+ (JDK)
- Node.js 18+
- npm

### Backend
```bash
cd selfquiz-backend
./mvnw spring-boot:run
# API chạy tại http://localhost:8080
```

### Frontend
```bash
cd selfquiz-frontend
npm install
npm run dev
# App chạy tại http://localhost:5173
```

## Documentation

- [📄 SRS - Đặc tả yêu cầu phần mềm](docs/SRS_SelfQuiz.md)

## License

Private project - All rights reserved.
