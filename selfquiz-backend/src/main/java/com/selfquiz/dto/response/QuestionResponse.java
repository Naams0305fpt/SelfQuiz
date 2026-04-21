package com.selfquiz.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
public class QuestionResponse {
    private Long id;
    private Long deckId;
    private String content;
    private String explanation;
    private List<AnswerResponse> answers;
    private LocalDateTime createdAt;

    @Data
    @AllArgsConstructor
    public static class AnswerResponse {
        private Long id;
        private String content;
        private boolean isCorrect;
    }
}
