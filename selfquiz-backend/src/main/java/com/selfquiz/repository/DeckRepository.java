package com.selfquiz.repository;

import com.selfquiz.model.Deck;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeckRepository extends JpaRepository<Deck, Long> {
    @EntityGraph(attributePaths = "questions")
    List<Deck> findBySubjectId(Long subjectId);

    boolean existsBySubjectIdAndNameIgnoreCase(Long subjectId, String name);

    @Override
    @EntityGraph(attributePaths = {"questions", "subject"})
    Optional<Deck> findById(Long id);
}
