package com.selfquiz.repository;

import com.selfquiz.model.Subject;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    boolean existsByNameIgnoreCase(String name);
    Optional<Subject> findByNameIgnoreCase(String name);

    @Override
    @EntityGraph(attributePaths = "decks")
    List<Subject> findAll();

    @Override
    @EntityGraph(attributePaths = "decks")
    Optional<Subject> findById(Long id);
}
