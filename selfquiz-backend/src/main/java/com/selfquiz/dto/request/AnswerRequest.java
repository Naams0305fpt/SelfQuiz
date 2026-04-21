package com.selfquiz.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AnswerRequest {
    @NotBlank(message = "Nội dung đáp án không được trống")
    @Size(max = 500, message = "Nội dung đáp án tối đa 500 ký tự")
    private String content;

    @JsonProperty("isCorrect")
    private boolean isCorrect;
}
