package com.selfquiz.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class TestSubmitRequest {
    @NotNull
    private Long deckId;

    private Integer timeTakenSeconds;

    @NotEmpty(message = "Danh sách câu trả lời không được trống")
    private List<TestAnswerRequest> answers;

    @Data
    public static class TestAnswerRequest {
        @NotNull
        private Long questionId;
        private List<Long> selectedAnswerIds;
    }
}
