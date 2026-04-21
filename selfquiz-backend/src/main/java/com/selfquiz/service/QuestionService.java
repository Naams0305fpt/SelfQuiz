package com.selfquiz.service;

import com.selfquiz.dto.request.QuestionRequest;
import com.selfquiz.dto.response.QuestionResponse;
import com.selfquiz.exception.BusinessException;
import com.selfquiz.exception.ResourceNotFoundException;
import com.selfquiz.model.Answer;
import com.selfquiz.model.Deck;
import com.selfquiz.model.Question;
import com.selfquiz.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final DeckService deckService;

    public Page<QuestionResponse> getQuestionsByDeck(Long deckId, Pageable pageable) {
        return questionRepository.findByDeckId(deckId, pageable)
                .map(this::toResponse);
    }

    public QuestionResponse getQuestionById(Long id) {
        return toResponse(findById(id));
    }

    @Transactional
    public QuestionResponse createQuestion(Long deckId, QuestionRequest request) {
        Deck deck = deckService.findById(deckId);
        validateAnswers(request);

        Question question = new Question(request.getContent(), request.getExplanation(), deck);
        request.getAnswers().forEach(ar -> {
            Answer answer = new Answer(ar.getContent(), ar.isCorrect(), question);
            question.getAnswers().add(answer);
        });

        return toResponse(questionRepository.save(question));
    }

    @Transactional
    public QuestionResponse updateQuestion(Long id, QuestionRequest request) {
        Question question = findById(id);
        validateAnswers(request);

        question.setContent(request.getContent());
        question.setExplanation(request.getExplanation());

        // Replace all answers
        question.getAnswers().clear();
        request.getAnswers().forEach(ar -> {
            Answer answer = new Answer(ar.getContent(), ar.isCorrect(), question);
            question.getAnswers().add(answer);
        });

        return toResponse(questionRepository.save(question));
    }

    @Transactional
    public void deleteQuestion(Long id) {
        Question question = findById(id);
        question.setDeleted(true);
        questionRepository.save(question);
    }

    public Question findById(Long id) {
        return questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy câu hỏi với id: " + id));
    }

    private void validateAnswers(QuestionRequest request) {
        long correctCount = request.getAnswers().stream()
                .filter(a -> a.isCorrect())
                .count();
        if (correctCount != 1) {
            throw new BusinessException("Câu hỏi phải có đúng 1 đáp án đúng (hiện có " + correctCount + ")");
        }
    }

    private QuestionResponse toResponse(Question question) {
        List<QuestionResponse.AnswerResponse> answers = question.getAnswers().stream()
                .map(a -> new QuestionResponse.AnswerResponse(a.getId(), a.getContent(), a.isCorrect()))
                .toList();
        return new QuestionResponse(
                question.getId(),
                question.getDeck().getId(),
                question.getContent(),
                question.getExplanation(),
                answers,
                question.getCreatedAt()
        );
    }
}
