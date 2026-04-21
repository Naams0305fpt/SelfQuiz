package com.selfquiz.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class QuestionRequest {
    @NotBlank(message = "Nội dung câu hỏi không được trống")
    @Size(max = 2000, message = "Nội dung câu hỏi tối đa 2000 ký tự")
    private String content;

    @NotBlank(message = "Giải thích không được trống")
    @Size(max = 3000, message = "Giải thích tối đa 3000 ký tự")
    private String explanation;

    @NotEmpty(message = "Phải có ít nhất 2 đáp án")
    @Size(min = 2, max = 5, message = "Số đáp án phải từ 2 đến 5")
    @Valid
    private List<AnswerRequest> answers;
}
