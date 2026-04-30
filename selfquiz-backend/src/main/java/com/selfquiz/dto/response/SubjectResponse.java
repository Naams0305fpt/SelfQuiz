package com.selfquiz.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class SubjectResponse {
    private Long id;
    private String name;
    private String description;
    private int deckCount;
    private LocalDateTime createdAt;
    private boolean isSample;
}
