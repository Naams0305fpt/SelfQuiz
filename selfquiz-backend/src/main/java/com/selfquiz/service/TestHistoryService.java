package com.selfquiz.service;

import com.selfquiz.dto.response.TestHistoryResponse;
import com.selfquiz.exception.ResourceNotFoundException;
import com.selfquiz.model.TestHistory;
import com.selfquiz.repository.TestHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TestHistoryService {

    private final TestHistoryRepository testHistoryRepository;

    public Page<TestHistoryResponse> getAllHistory(Pageable pageable) {
        return testHistoryRepository.findAllByOrderByTestedAtDesc(pageable)
                .map(this::toResponse);
    }

    public Page<TestHistoryResponse> getHistoryByDeck(Long deckId, Pageable pageable) {
        return testHistoryRepository.findByDeckIdOrderByTestedAtDesc(deckId, pageable)
                .map(this::toResponse);
    }

    public void deleteHistory(Long id) {
        if (!testHistoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy lịch sử với id: " + id);
        }
        testHistoryRepository.deleteById(id);
    }

    private TestHistoryResponse toResponse(TestHistory history) {
        double percentage = history.getTotalQuestions() > 0
                ? (double) history.getScore() / history.getTotalQuestions() * 100
                : 0;
        return new TestHistoryResponse(
                history.getId(),
                history.getDeck() != null ? history.getDeck().getId() : null,
                history.getDeckName(),
                history.getScore(),
                history.getTotalQuestions(),
                Math.round(percentage * 10.0) / 10.0,
                history.getTimeTakenSeconds(),
                history.getTestedAt()
        );
    }
}
