package com.selfquiz.dto.response;

import com.selfquiz.dto.request.QuestionRequest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParsedQuestionDTO {
    private int index; // Vị trí câu hỏi trong file/text (dùng để báo lỗi)
    private QuestionRequest question;
    private boolean isValid;
    private List<String> errorMessages;
}
