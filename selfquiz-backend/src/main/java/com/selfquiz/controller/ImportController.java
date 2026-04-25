package com.selfquiz.controller;

import com.selfquiz.dto.request.ImportTextRequest;
import com.selfquiz.dto.request.QuestionRequest;
import com.selfquiz.dto.response.ImportPreviewResponse;
import com.selfquiz.service.QuestionImportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/decks/{deckId}/import")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class ImportController {

    private final QuestionImportService importService;

    @PostMapping("/preview/text")
    public ResponseEntity<ImportPreviewResponse> previewTextImport(
            @PathVariable Long deckId,
            @Valid @RequestBody ImportTextRequest request) {
        // deckId is taken to validate permission later if needed
        ImportPreviewResponse response = importService.previewAikenText(request.getRawText());
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/preview/excel", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImportPreviewResponse> previewExcelImport(
            @PathVariable Long deckId,
            @RequestParam("file") MultipartFile file) {
        
        // Basic MIME validation
        String contentType = file.getContentType();
        if (contentType == null || !contentType.equals("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")) {
            throw new IllegalArgumentException("Định dạng file không hợp lệ. Vui lòng upload file Excel (.xlsx).");
        }

        ImportPreviewResponse response = importService.previewExcelFile(file);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/commit")
    public ResponseEntity<Map<String, String>> commitImport(
            @PathVariable Long deckId,
            @Valid @RequestBody List<QuestionRequest> questions) {
        
        if (questions == null || questions.isEmpty()) {
            throw new IllegalArgumentException("Danh sách câu hỏi trống.");
        }

        importService.commitImport(deckId, questions);
        
        return ResponseEntity.ok(Map.of(
            "message", "Đã lưu " + questions.size() + " câu hỏi thành công.",
            "status", "success"
        ));
    }
}
