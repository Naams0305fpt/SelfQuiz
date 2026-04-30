package com.selfquiz.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class DeckResponse {
    private Long id;
    private Long subjectId;
    private String name;
    private String description;
    private long questionCount;
    private LocalDateTime createdAt;
    private boolean isSample;
}
