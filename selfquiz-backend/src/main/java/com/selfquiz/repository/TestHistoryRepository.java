package com.selfquiz.repository;

import com.selfquiz.model.TestHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TestHistoryRepository extends JpaRepository<TestHistory, Long> {
    Page<TestHistory> findAllByOrderByTestedAtDesc(Pageable pageable);
    Page<TestHistory> findByDeckIdOrderByTestedAtDesc(Long deckId, Pageable pageable);
}
