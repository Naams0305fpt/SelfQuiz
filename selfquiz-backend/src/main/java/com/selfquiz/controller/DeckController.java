package com.selfquiz.controller;

import com.selfquiz.dto.request.DeckRequest;
import com.selfquiz.dto.response.DeckResponse;
import com.selfquiz.service.DeckService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class DeckController {

    private final DeckService deckService;

    @GetMapping("/subjects/{subjectId}/decks")
    public ResponseEntity<List<DeckResponse>> getDecksBySubject(@PathVariable Long subjectId) {
        return ResponseEntity.ok(deckService.getDecksBySubject(subjectId));
    }

    @GetMapping("/decks/{id}")
    public ResponseEntity<DeckResponse> getDeckById(@PathVariable Long id) {
        return ResponseEntity.ok(deckService.getDeckById(id));
    }

    @PostMapping("/subjects/{subjectId}/decks")
    public ResponseEntity<DeckResponse> createDeck(@PathVariable Long subjectId, @Valid @RequestBody DeckRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(deckService.createDeck(subjectId, request));
    }

    @PutMapping("/decks/{id}")
    public ResponseEntity<DeckResponse> updateDeck(@PathVariable Long id, @Valid @RequestBody DeckRequest request) {
        return ResponseEntity.ok(deckService.updateDeck(id, request));
    }

    @DeleteMapping("/decks/{id}")
    public ResponseEntity<Void> deleteDeck(@PathVariable Long id) {
        deckService.deleteDeck(id);
        return ResponseEntity.noContent().build();
    }
}
