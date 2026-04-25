package com.selfquiz.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ImportTextRequest {
    @NotBlank(message = "Nội dung văn bản không được trống")
    private String rawText;
}
