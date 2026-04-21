package com.selfquiz.service;

import com.selfquiz.dto.request.TestGenerateRequest;
import com.selfquiz.dto.request.TestSubmitRequest;
import com.selfquiz.dto.response.TestGenerateResponse;
import com.selfquiz.dto.response.TestSubmitResponse;
import com.selfquiz.exception.BusinessException;
import com.selfquiz.model.Answer;
import com.selfquiz.model.Deck;
import com.selfquiz.model.Question;
import com.selfquiz.model.TestHistory;
import com.selfquiz.repository.QuestionRepository;
import com.selfquiz.repository.TestHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TestService {

    private final QuestionRepository questionRepository;
    private final TestHistoryRepository testHistoryRepository;
    private final DeckService deckService;

    public TestGenerateResponse generateTest(TestGenerateRequest request) {
        Deck deck = deckService.findById(request.getDeckId());
        long totalQuestions = questionRepository.countByDeckIdAndIsDeletedFalse(deck.getId());

        if (totalQuestions == 0) {
            throw new BusinessException("Bộ đề '" + deck.getName() + "' chưa có câu hỏi nào");
        }

        if (request.getNumberOfQuestions() > totalQuestions) {
            throw new BusinessException("Bộ đề chỉ có " + totalQuestions + " câu, không thể tạo bài test " + request.getNumberOfQuestions() + " câu");
        }

        // Get random questions
        List<Question> questions = questionRepository.findRandomByDeckId(
                deck.getId(),
                PageRequest.of(0, request.getNumberOfQuestions())
        );

        // Build response with shuffled answers
        List<TestGenerateResponse.TestQuestion> testQuestions = questions.stream()
                .map(q -> {
                    List<TestGenerateResponse.TestAnswer> answers = new ArrayList<>(
                            q.getAnswers().stream()
                                    .map(a -> new TestGenerateResponse.TestAnswer(a.getId(), a.getContent()))
                                    .toList()
                    );
                    // Fisher-Yates shuffle for answers
                    Collections.shuffle(answers);
                    
                    long correctCount = q.getAnswers().stream().filter(Answer::isCorrect).count();
                    boolean multipleSelect = correctCount > 1;

                    return new TestGenerateResponse.TestQuestion(q.getId(), q.getContent(), multipleSelect, answers);
                })
                .toList();

        return new TestGenerateResponse(deck.getId(), deck.getName(), testQuestions);
    }

    @Transactional
    public TestSubmitResponse submitTest(TestSubmitRequest request) {
        Deck deck = deckService.findById(request.getDeckId());

        // Collect all question IDs from submission
        List<Long> questionIds = request.getAnswers().stream()
                .map(TestSubmitRequest.TestAnswerRequest::getQuestionId)
                .toList();

        // Load all questions with answers
        List<Question> questions = questionRepository.findAllById(questionIds);
        Map<Long, Question> questionMap = questions.stream()
                .collect(Collectors.toMap(Question::getId, q -> q));

        // Grade
        List<TestSubmitResponse.QuestionResult> results = new ArrayList<>();
        int correctCount = 0;

        for (TestSubmitRequest.TestAnswerRequest userAnswer : request.getAnswers()) {
            Question question = questionMap.get(userAnswer.getQuestionId());
            if (question == null) continue;

            List<Long> correctAnswerIds = question.getAnswers().stream()
                    .filter(Answer::isCorrect)
                    .map(Answer::getId)
                    .sorted()
                    .toList();

            List<Long> selectedAnswerIds = userAnswer.getSelectedAnswerIds() != null
                    ? userAnswer.getSelectedAnswerIds().stream().sorted().toList()
                    : new ArrayList<>();

            boolean isCorrect = !correctAnswerIds.isEmpty() && correctAnswerIds.equals(selectedAnswerIds);
            if (isCorrect) correctCount++;

            List<TestSubmitResponse.AnswerDetail> answerDetails = question.getAnswers().stream()
                    .map(a -> new TestSubmitResponse.AnswerDetail(a.getId(), a.getContent(), a.isCorrect()))
                    .toList();

            results.add(new TestSubmitResponse.QuestionResult(
                    question.getId(),
                    question.getContent(),
                    isCorrect,
                    userAnswer.getSelectedAnswerIds(),
                    correctAnswerIds,
                    isCorrect ? null : question.getExplanation(),
                    answerDetails
            ));
        }

        int totalQuestions = request.getAnswers().size();
        double percentage = totalQuestions > 0 ? (double) correctCount / totalQuestions * 100 : 0;
        String evaluation = getEvaluation(percentage);

        // Save history
        TestHistory history = new TestHistory(
                deck,
                deck.getName(),
                correctCount,
                totalQuestions,
                request.getTimeTakenSeconds()
        );
        testHistoryRepository.save(history);

        return new TestSubmitResponse(
                history.getId(),
                correctCount,
                totalQuestions,
                Math.round(percentage * 10.0) / 10.0,
                evaluation,
                request.getTimeTakenSeconds(),
                results
        );
    }

    private String getEvaluation(double percentage) {
        if (percentage >= 90) return "Excellent";
        if (percentage >= 70) return "Good";
        if (percentage >= 50) return "Average";
        return "Need Improvement";
    }
}
