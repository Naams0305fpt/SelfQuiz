package com.selfquiz.repository;

import com.selfquiz.model.Deck;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeckRepository extends JpaRepository<Deck, Long> {
    List<Deck> findBySubjectId(Long subjectId);
    boolean existsBySubjectIdAndNameIgnoreCase(Long subjectId, String name);
}
