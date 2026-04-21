package com.selfquiz.controller;

import com.selfquiz.dto.request.TestGenerateRequest;
import com.selfquiz.dto.request.TestSubmitRequest;
import com.selfquiz.dto.response.TestGenerateResponse;
import com.selfquiz.dto.response.TestSubmitResponse;
import com.selfquiz.service.TestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/tests")
@RequiredArgsConstructor
public class TestController {

    private final TestService testService;

    @PostMapping("/generate")
    public ResponseEntity<TestGenerateResponse> generateTest(@Valid @RequestBody TestGenerateRequest request) {
        return ResponseEntity.ok(testService.generateTest(request));
    }

    @PostMapping("/submit")
    public ResponseEntity<TestSubmitResponse> submitTest(@Valid @RequestBody TestSubmitRequest request) {
        return ResponseEntity.ok(testService.submitTest(request));
    }
}
