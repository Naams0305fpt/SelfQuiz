package com.selfquiz.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class TestSubmitResponse {
    private Long testHistoryId;
    private int score;
    private int totalQuestions;
    private double percentage;
    private String evaluation;
    private Integer timeTakenSeconds;
    private List<QuestionResult> results;

    @Data
    @AllArgsConstructor
    public static class QuestionResult {
        private Long questionId;
        private String content;
        private boolean isCorrect;
        private List<Long> selectedAnswerIds;
        private List<Long> correctAnswerIds;
        private String explanation; // null if answered correctly
        private List<AnswerDetail> answers;
    }

    @Data
    @AllArgsConstructor
    public static class AnswerDetail {
        private Long id;
        private String content;
        private boolean isCorrect;
    }
}
