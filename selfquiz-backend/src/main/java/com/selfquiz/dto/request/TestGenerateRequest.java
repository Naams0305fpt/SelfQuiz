package com.selfquiz.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TestGenerateRequest {
    @NotNull(message = "DeckId không được trống")
    private Long deckId;

    @Min(value = 1, message = "Số câu hỏi tối thiểu là 1")
    private int numberOfQuestions;
}
