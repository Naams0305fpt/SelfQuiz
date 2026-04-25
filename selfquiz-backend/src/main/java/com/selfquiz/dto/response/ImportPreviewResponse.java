package com.selfquiz.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImportPreviewResponse {
    private int totalQuestions;
    private int validQuestions;
    private int invalidQuestions;
    private boolean canImport;
    private List<ParsedQuestionDTO> parsedQuestions;
}
