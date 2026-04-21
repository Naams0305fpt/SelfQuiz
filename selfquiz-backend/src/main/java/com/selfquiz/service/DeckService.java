package com.selfquiz.service;

import com.selfquiz.dto.request.DeckRequest;
import com.selfquiz.dto.response.DeckResponse;
import com.selfquiz.exception.BusinessException;
import com.selfquiz.exception.ResourceNotFoundException;
import com.selfquiz.model.Deck;
import com.selfquiz.model.Subject;
import com.selfquiz.repository.DeckRepository;
import com.selfquiz.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DeckService {

    private final DeckRepository deckRepository;
    private final QuestionRepository questionRepository;
    private final SubjectService subjectService;

    public List<DeckResponse> getDecksBySubject(Long subjectId) {
        return deckRepository.findBySubjectId(subjectId).stream()
                .map(this::toResponse)
                .toList();
    }

    public DeckResponse getDeckById(Long id) {
        return toResponse(findById(id));
    }

    @Transactional
    public DeckResponse createDeck(Long subjectId, DeckRequest request) {
        Subject subject = subjectService.findById(subjectId);
        if (deckRepository.existsBySubjectIdAndNameIgnoreCase(subjectId, request.getName())) {
            throw new BusinessException("Bộ đề '" + request.getName() + "' đã tồn tại trong môn học này");
        }
        Deck deck = new Deck(request.getName(), request.getDescription(), subject);
        return toResponse(deckRepository.save(deck));
    }

    @Transactional
    public DeckResponse updateDeck(Long id, DeckRequest request) {
        Deck deck = findById(id);
        if (deckRepository.existsBySubjectIdAndNameIgnoreCase(deck.getSubject().getId(), request.getName())
                && !deck.getName().equalsIgnoreCase(request.getName())) {
            throw new BusinessException("Bộ đề '" + request.getName() + "' đã tồn tại trong môn học này");
        }
        deck.setName(request.getName());
        deck.setDescription(request.getDescription());
        return toResponse(deckRepository.save(deck));
    }

    @Transactional
    public void deleteDeck(Long id) {
        Deck deck = findById(id);
        deck.setDeleted(true);
        deck.getQuestions().forEach(q -> q.setDeleted(true));
        deckRepository.save(deck);
    }

    public Deck findById(Long id) {
        return deckRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bộ đề với id: " + id));
    }

    private DeckResponse toResponse(Deck deck) {
        long questionCount = questionRepository.countByDeckIdAndIsDeletedFalse(deck.getId());
        return new DeckResponse(
                deck.getId(),
                deck.getSubject().getId(),
                deck.getName(),
                deck.getDescription(),
                questionCount,
                deck.getCreatedAt()
        );
    }
}
