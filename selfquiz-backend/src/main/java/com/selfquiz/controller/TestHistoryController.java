package com.selfquiz.controller;

import com.selfquiz.dto.response.TestHistoryResponse;
import com.selfquiz.service.TestHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/test-histories")
@RequiredArgsConstructor
public class TestHistoryController {

    private final TestHistoryService testHistoryService;

    @GetMapping
    public ResponseEntity<Page<TestHistoryResponse>> getAllHistory(
            @RequestParam(required = false) Long deckId,
            @PageableDefault(size = 20) Pageable pageable) {
        if (deckId != null) {
            return ResponseEntity.ok(testHistoryService.getHistoryByDeck(deckId, pageable));
        }
        return ResponseEntity.ok(testHistoryService.getAllHistory(pageable));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHistory(@PathVariable Long id) {
        testHistoryService.deleteHistory(id);
        return ResponseEntity.noContent().build();
    }
}
