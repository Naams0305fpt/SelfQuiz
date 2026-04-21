package com.selfquiz.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class TestGenerateResponse {
    private Long deckId;
    private String deckName;
    private List<TestQuestion> questions;

    @Data
    @AllArgsConstructor
    public static class TestQuestion {
        private Long questionId;
        private String content;
        private boolean multipleSelect;
        private List<TestAnswer> answers;
    }

    @Data
    @AllArgsConstructor
    public static class TestAnswer {
        private Long answerId;
        private String content;
        // NOTE: isCorrect is intentionally NOT included to prevent cheating
    }
}
