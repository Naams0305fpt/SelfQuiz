package com.selfquiz.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class TestHistoryResponse {
    private Long id;
    private Long deckId;
    private String deckName;
    private int score;
    private int totalQuestions;
    private double percentage;
    private Integer timeTakenSeconds;
    private LocalDateTime testedAt;
}
