package com.selfquiz.service;

import com.selfquiz.dto.request.SubjectRequest;
import com.selfquiz.dto.response.SubjectResponse;
import com.selfquiz.exception.BusinessException;
import com.selfquiz.exception.ResourceNotFoundException;
import com.selfquiz.model.Subject;
import com.selfquiz.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import com.selfquiz.security.SecurityUtils;

@Service
@RequiredArgsConstructor
public class SubjectService {

    private final SubjectRepository subjectRepository;

    public List<SubjectResponse> getAllSubjects() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        return subjectRepository.findUserAndAdminSubjects(currentUserId).stream()
                .map(this::toResponse)
                .toList();
    }

    public SubjectResponse getSubjectById(Long id) {
        return toResponse(findById(id));
    }

    @Transactional
    public SubjectResponse createSubject(SubjectRequest request) {
        if (subjectRepository.existsByNameIgnoreCase(request.getName())) {
            throw new BusinessException("Môn học '" + request.getName() + "' đã tồn tại");
        }
        Subject subject = new Subject(request.getName(), request.getDescription());
        return toResponse(subjectRepository.save(subject));
    }

    @Transactional
    public SubjectResponse updateSubject(Long id, SubjectRequest request) {
        Subject subject = findById(id);
        subjectRepository.findByNameIgnoreCase(request.getName())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new BusinessException("Môn học '" + request.getName() + "' đã tồn tại");
                });
        subject.setName(request.getName());
        subject.setDescription(request.getDescription());
        return toResponse(subjectRepository.save(subject));
    }

    @Transactional
    public void deleteSubject(Long id) {
        Subject subject = findById(id);
        // Cascade soft delete
        subject.setDeleted(true);
        subject.getDecks().forEach(deck -> {
            deck.setDeleted(true);
            deck.getQuestions().forEach(q -> q.setDeleted(true));
        });
        subjectRepository.save(subject);
    }

    public Subject findById(Long id) {
        return subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy môn học với id: " + id));
    }

    private SubjectResponse toResponse(Subject subject) {
        int deckCount = (int) subject.getDecks().stream()
                .filter(d -> !d.isDeleted())
                .count();
        boolean isSample = false;
        try {
            Long currentUserId = SecurityUtils.getCurrentUserId();
            isSample = subject.getCreatedBy() != null && !subject.getCreatedBy().equals(currentUserId);
        } catch (Exception e) {
            // Not authenticated
        }

        return new SubjectResponse(
                subject.getId(),
                subject.getName(),
                subject.getDescription(),
                deckCount,
                subject.getCreatedAt(),
                isSample
        );
    }
}
