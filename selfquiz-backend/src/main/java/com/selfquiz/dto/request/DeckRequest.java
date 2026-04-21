package com.selfquiz.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DeckRequest {
    @NotBlank(message = "Tên bộ đề không được trống")
    @Size(max = 150, message = "Tên bộ đề tối đa 150 ký tự")
    private String name;

    @Size(max = 500, message = "Mô tả tối đa 500 ký tự")
    private String description;
}
