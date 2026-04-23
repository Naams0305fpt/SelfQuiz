# 📝 SelfQuiz - Hệ thống Ôn tập Trắc nghiệm Cá nhân

Ứng dụng web giúp người dùng tạo, quản lý và thực hiện các bài kiểm tra trắc nghiệm ngẫu nhiên từ bộ dữ liệu câu hỏi tự soạn. Hỗ trợ câu hỏi đơn đáp án và **nhiều đáp án đúng** (multi-select).

## 🏗️ Tech Stack

| Component | Technology | Version |
|---|---|---|
| **Backend** | Spring Boot | 3.5.x |
| **Language** | Java | 25 |
| **Database** | H2 (file-based) | 2.3 |
| **ORM** | Spring Data JPA + Hibernate | 7.0 |
| **Frontend** | React | 18.x |
| **Build Tool** | Vite | 8.x |
| **HTTP Client** | Axios | 1.9.x |
| **Markdown** | react-markdown + react-syntax-highlighter | latest |

## 📁 Project Structure

```
SelfQuiz/
├── docs/                          # Tài liệu đặc tả (SRS v1.3)
├── selfquiz-backend/              # Spring Boot REST API
│   └── src/main/java/com/selfquiz/
│       ├── config/                # CORS configuration
│       ├── controller/            # 5 REST controllers
│       ├── dto/                   # Request & Response DTOs
│       │   ├── request/           # 6 request DTOs
│       │   └── response/          # 6 response DTOs
│       ├── exception/             # Global exception handler
│       ├── model/                 # 5 JPA entities
│       ├── repository/            # 5 JPA repositories
│       └── service/               # 5 service classes
└── selfquiz-frontend/             # React SPA (Vite)
    └── src/
        ├── components/            # Layout, Markdown, ConfirmDialog
        ├── pages/                 # 7 pages
        └── services/              # Axios API layer
```

## ✨ Features

### Giai đoạn 1 - MVP ✅
- ✅ **CRUD Môn học** (Subjects) — Tạo, sửa, xóa mềm, danh sách
- ✅ **CRUD Bộ đề** (Decks) — Liên kết với môn học
- ✅ **CRUD Câu hỏi** — Hỗ trợ Markdown, 2-5 đáp án
- ✅ **Multi-select** — Câu hỏi có thể có nhiều đáp án đúng (checkbox)
- ✅ **Làm bài test** — Ngẫu nhiên câu hỏi + xáo trộn đáp án (Fisher-Yates)
- ✅ **Chấm điểm tự động** — Hỗ trợ cả single & multi-select grading
- ✅ **Giải thích** — Hiển thị giải thích cho câu trả lời sai
- ✅ **Lịch sử làm bài** — Phân trang, xóa record
- ✅ **Soft Delete** — Xóa mềm cascade (Subject → Deck → Question)
- ✅ **Dark Theme** — Giao diện tối hiện đại, glassmorphism
- ✅ **Responsive** — Tương thích Desktop, Tablet, Mobile

### API Endpoints

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/api/v1/subjects` | Danh sách môn học |
| `POST` | `/api/v1/subjects` | Tạo môn học |
| `PUT` | `/api/v1/subjects/{id}` | Cập nhật môn học |
| `DELETE` | `/api/v1/subjects/{id}` | Xóa mềm môn học |
| `GET` | `/api/v1/subjects/{id}/decks` | Danh sách bộ đề |
| `POST` | `/api/v1/subjects/{id}/decks` | Tạo bộ đề |
| `PUT` | `/api/v1/decks/{id}` | Cập nhật bộ đề |
| `DELETE` | `/api/v1/decks/{id}` | Xóa mềm bộ đề |
| `GET` | `/api/v1/decks/{id}/questions` | Danh sách câu hỏi (phân trang) |
| `POST` | `/api/v1/decks/{id}/questions` | Tạo câu hỏi |
| `PUT` | `/api/v1/questions/{id}` | Cập nhật câu hỏi |
| `DELETE` | `/api/v1/questions/{id}` | Xóa mềm câu hỏi |
| `POST` | `/api/v1/tests/generate` | Tạo bài test ngẫu nhiên |
| `POST` | `/api/v1/tests/submit` | Nộp bài & chấm điểm |
| `GET` | `/api/v1/history` | Lịch sử làm bài (phân trang) |
| `DELETE` | `/api/v1/history/{id}` | Xóa record lịch sử |

## 🚀 Getting Started

### Prerequisites
- **Java 25+** (JDK) — [Download](https://jdk.java.net/)
- **Node.js 18+** — [Download](https://nodejs.org/)
- **npm** (included with Node.js)

### Backend
```bash
cd selfquiz-backend

# Chạy dev server (port 8080)
./mvnw spring-boot:run      # Linux/Mac
.\mvnw.cmd spring-boot:run  # Windows

# API: http://localhost:8080
# H2 Console: http://localhost:8080/h2-console
#   JDBC URL: jdbc:h2:file:./data/selfquiz
#   Username: sa | Password: (trống)
```

### Frontend
```bash
cd selfquiz-frontend

# Cài dependencies
npm install

# Chạy dev server (port 5173)
npm run dev

# App: http://localhost:5173
```

## 🗄️ Database Schema (ER Diagram)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Subject   │ 1:N │    Deck     │ 1:N │  Question   │ 1:N │   Answer    │
├─────────────┤     ├─────────────┤     ├─────────────┤     ├─────────────┤
│ id          │────▶│ id          │────▶│ id          │────▶│ id          │
│ name        │     │ subject_id  │     │ deck_id     │     │ question_id │
│ description │     │ name        │     │ content     │     │ content     │
│ is_deleted  │     │ description │     │ explanation │     │ is_correct  │
│ created_at  │     │ is_deleted  │     │ is_deleted  │     │ created_at  │
│ updated_at  │     │ created_at  │     │ created_at  │     └─────────────┘
└─────────────┘     │ updated_at  │     │ updated_at  │
                    └─────────────┘     └─────────────┘

┌─────────────────┐
│  TestHistory    │
├─────────────────┤
│ id              │
│ deck_id         │
│ deck_name       │  ← Snapshot tên deck tại thời điểm làm bài
│ score           │
│ total_questions │
│ percentage      │
│ time_taken_sec  │
│ evaluation      │
│ tested_at       │
└─────────────────┘
```

## 📖 Documentation

- [📄 SRS - Đặc tả yêu cầu phần mềm v1.3](docs/SRS_SelfQuiz.md)

## 🔧 Development Notes

- **Soft Delete**: Sử dụng `@SQLRestriction("is_deleted = false")` để tự động filter
- **Cascade Delete**: Xóa Subject → cascade soft-delete Decks → Questions
- **Multi-answer**: Câu hỏi hỗ trợ 1-N đáp án đúng, backend chấm bằng set comparison
- **Eager Loading**: `@EntityGraph` trên tất cả repositories để tránh `LazyInitializationException`
- **CORS**: Cho phép `http://localhost:5173` (dev frontend)
- **Jackson**: Dùng `@JsonProperty("isCorrect")` cho boolean serialization consistency

## 📄 License

Private project - All rights reserved.
