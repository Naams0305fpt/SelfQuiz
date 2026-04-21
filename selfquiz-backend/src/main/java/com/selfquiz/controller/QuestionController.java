package com.selfquiz.controller;

import com.selfquiz.dto.request.QuestionRequest;
import com.selfquiz.dto.response.QuestionResponse;
import com.selfquiz.service.QuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;

    @GetMapping("/decks/{deckId}/questions")
    public ResponseEntity<Page<QuestionResponse>> getQuestionsByDeck(
            @PathVariable Long deckId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(questionService.getQuestionsByDeck(deckId, pageable));
    }

    @GetMapping("/questions/{id}")
    public ResponseEntity<QuestionResponse> getQuestionById(@PathVariable Long id) {
        return ResponseEntity.ok(questionService.getQuestionById(id));
    }

    @PostMapping("/decks/{deckId}/questions")
    public ResponseEntity<QuestionResponse> createQuestion(
            @PathVariable Long deckId,
            @Valid @RequestBody QuestionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(questionService.createQuestion(deckId, request));
    }

    @PutMapping("/questions/{id}")
    public ResponseEntity<QuestionResponse> updateQuestion(
            @PathVariable Long id,
            @Valid @RequestBody QuestionRequest request) {
        return ResponseEntity.ok(questionService.updateQuestion(id, request));
    }

    @DeleteMapping("/questions/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }
}
