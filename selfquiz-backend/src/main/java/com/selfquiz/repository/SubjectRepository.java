package com.selfquiz.repository;

import com.selfquiz.model.Subject;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Query("SELECT s FROM Subject s WHERE s.isDeleted = false AND (s.createdBy = :userId OR s.createdBy IN (SELECT u.id FROM User u WHERE u.role = 'ROLE_ADMIN'))")
    @EntityGraph(attributePaths = "decks")
    List<Subject> findUserAndAdminSubjects(@Param("userId") Long userId);

    @Override
    @EntityGraph(attributePaths = "decks")
    Optional<Subject> findById(Long id);
}
