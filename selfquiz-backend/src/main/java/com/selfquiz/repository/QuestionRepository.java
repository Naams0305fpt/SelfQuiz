package com.selfquiz.repository;

import com.selfquiz.model.Question;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    Page<Question> findByDeckId(Long deckId, Pageable pageable);

    long countByDeckIdAndIsDeletedFalse(Long deckId);

    @Query(value = "SELECT q FROM Question q WHERE q.deck.id = :deckId AND q.isDeleted = false ORDER BY FUNCTION('RAND')")
    List<Question> findRandomByDeckId(@Param("deckId") Long deckId, Pageable pageable);
}
