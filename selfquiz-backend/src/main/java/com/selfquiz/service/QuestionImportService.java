package com.selfquiz.service;

import com.selfquiz.dto.request.AnswerRequest;
import com.selfquiz.dto.request.QuestionRequest;
import com.selfquiz.dto.response.ImportPreviewResponse;
import com.selfquiz.dto.response.ParsedQuestionDTO;
import com.selfquiz.model.Deck;
import com.selfquiz.exception.ResourceNotFoundException;
import com.selfquiz.repository.DeckRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionImportService {

    private final DeckRepository deckRepository;
    private final QuestionService questionService;

    // Pattern for matching Answer lines like "A. text" or "B) text"
    private static final Pattern OPTION_PATTERN = Pattern.compile("^([A-E])[.)]\\s+(.*)$", Pattern.CASE_INSENSITIVE);
    private static final Pattern ANSWER_PATTERN = Pattern.compile("^ANSWER:\\s*(.*)$", Pattern.CASE_INSENSITIVE);
    private static final Pattern EXPLANATION_PATTERN = Pattern.compile("^EXPLANATION:\\s*(.*)$", Pattern.CASE_INSENSITIVE);

    public ImportPreviewResponse previewAikenText(String rawText) {
        if (rawText == null || rawText.trim().isEmpty()) {
            return new ImportPreviewResponse(0, 0, 0, false, List.of());
        }

        // Tách các câu hỏi bằng một hoặc nhiều dòng trống
        String[] blocks = rawText.split("(?m)^\\s*$");
        List<ParsedQuestionDTO> parsedQuestions = new ArrayList<>();
        int index = 1;

        for (String block : blocks) {
            String trimmedBlock = block.trim();
            if (trimmedBlock.isEmpty()) continue;
            
            parsedQuestions.add(parseSingleAikenBlock(index++, trimmedBlock));
        }

        return buildPreviewResponse(parsedQuestions);
    }

    private ParsedQuestionDTO parseSingleAikenBlock(int index, String block) {
        String[] lines = block.split("\\r?\\n");
        List<String> errorMessages = new ArrayList<>();
        
        if (lines.length < 3) {
            errorMessages.add("Dòng " + index + ": Khối văn bản quá ngắn, không đủ câu hỏi và đáp án.");
            return ParsedQuestionDTO.builder().index(index).isValid(false).errorMessages(errorMessages).build();
        }

        String questionContent = lines[0].trim();
        Map<String, String> options = new LinkedHashMap<>();
        String correctAnswersRaw = null;
        String explanation = null;

        for (int i = 1; i < lines.length; i++) {
            String line = lines[i].trim();
            if (line.isEmpty()) continue;

            Matcher optionMatcher = OPTION_PATTERN.matcher(line);
            Matcher answerMatcher = ANSWER_PATTERN.matcher(line);
            Matcher explanationMatcher = EXPLANATION_PATTERN.matcher(line);

            if (optionMatcher.matches()) {
                options.put(optionMatcher.group(1).toUpperCase(), optionMatcher.group(2).trim());
            } else if (answerMatcher.matches()) {
                correctAnswersRaw = answerMatcher.group(1).trim().toUpperCase();
            } else if (explanationMatcher.matches()) {
                explanation = explanationMatcher.group(1).trim();
            } else {
                // Nếu không match cái nào mà chưa thấy ANSWER, ta nối vào câu hỏi (hỗ trợ câu hỏi nhiều dòng)
                if (options.isEmpty() && correctAnswersRaw == null) {
                    questionContent += "\n" + line;
                }
            }
        }

        return validateAndBuildDTO(index, questionContent, options, correctAnswersRaw, explanation, errorMessages);
    }

    public ImportPreviewResponse previewExcelFile(MultipartFile file) {
        List<ParsedQuestionDTO> parsedQuestions = new ArrayList<>();
        try (InputStream is = file.getInputStream(); Workbook workbook = WorkbookFactory.create(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            int index = 1;

            for (Row row : sheet) {
                if (row.getRowNum() == 0) continue; // Bỏ qua header
                
                // Đọc cột: 0=Question, 1=A, 2=B, 3=C, 4=D, 5=E, 6=Answer, 7=Explanation
                String questionContent = getCellValueAsString(row.getCell(0));
                if (questionContent.isEmpty()) continue;

                Map<String, String> options = new LinkedHashMap<>();
                addOptionIfNotEmpty("A", getCellValueAsString(row.getCell(1)), options);
                addOptionIfNotEmpty("B", getCellValueAsString(row.getCell(2)), options);
                addOptionIfNotEmpty("C", getCellValueAsString(row.getCell(3)), options);
                addOptionIfNotEmpty("D", getCellValueAsString(row.getCell(4)), options);
                addOptionIfNotEmpty("E", getCellValueAsString(row.getCell(5)), options);

                String correctAnswersRaw = getCellValueAsString(row.getCell(6)).toUpperCase();
                String explanation = getCellValueAsString(row.getCell(7));

                List<String> errorMessages = new ArrayList<>();
                parsedQuestions.add(validateAndBuildDTO(index++, questionContent, options, correctAnswersRaw, explanation, errorMessages));
            }

        } catch (Exception e) {
            ParsedQuestionDTO errorDto = ParsedQuestionDTO.builder()
                    .index(1).isValid(false).errorMessages(List.of("Lỗi đọc file Excel: " + e.getMessage())).build();
            parsedQuestions.add(errorDto);
        }

        return buildPreviewResponse(parsedQuestions);
    }

    private void addOptionIfNotEmpty(String letter, String value, Map<String, String> options) {
        if (!value.isEmpty()) {
            options.put(letter, value);
        }
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        DataFormatter formatter = new DataFormatter();
        return formatter.formatCellValue(cell).trim();
    }

    private ParsedQuestionDTO validateAndBuildDTO(int index, String questionContent, Map<String, String> options, 
                                                  String correctAnswersRaw, String explanation, List<String> errorMessages) {
        if (options.size() < 2) {
            errorMessages.add("Cần ít nhất 2 đáp án (A, B).");
        }
        if (correctAnswersRaw == null || correctAnswersRaw.isEmpty()) {
            errorMessages.add("Thiếu chỉ định đáp án đúng (ANSWER).");
        }

        List<AnswerRequest> answerRequests = new ArrayList<>();
        Set<String> correctKeys = new HashSet<>();
        
        if (correctAnswersRaw != null) {
            // Có thể chứa phẩy: "A, C"
            String[] parts = correctAnswersRaw.split("[,\\s]+");
            for (String p : parts) {
                if (!p.isEmpty()) correctKeys.add(p);
            }
        }

        boolean hasAtLeastOneCorrect = false;

        for (Map.Entry<String, String> entry : options.entrySet()) {
            boolean isCorrect = correctKeys.contains(entry.getKey());
            if (isCorrect) hasAtLeastOneCorrect = true;
            
            AnswerRequest ans = new AnswerRequest();
            ans.setContent(entry.getValue());
            ans.setCorrect(isCorrect);
            answerRequests.add(ans);
        }

        if (correctAnswersRaw != null && !correctAnswersRaw.isEmpty() && !hasAtLeastOneCorrect) {
            errorMessages.add("Đáp án đúng '" + correctAnswersRaw + "' không khớp với bất kỳ lựa chọn nào.");
        }

        QuestionRequest request = new QuestionRequest();
        request.setContent(questionContent);
        // Default explanation if empty
        request.setExplanation(explanation != null && !explanation.isEmpty() ? explanation : "Chưa có giải thích chi tiết.");
        request.setAnswers(answerRequests);

        boolean isValid = errorMessages.isEmpty();

        return ParsedQuestionDTO.builder()
                .index(index)
                .question(isValid ? request : null)
                .isValid(isValid)
                .errorMessages(errorMessages)
                .build();
    }

    private ImportPreviewResponse buildPreviewResponse(List<ParsedQuestionDTO> parsedQuestions) {
        int valid = (int) parsedQuestions.stream().filter(ParsedQuestionDTO::isValid).count();
        int invalid = parsedQuestions.size() - valid;
        
        return ImportPreviewResponse.builder()
                .totalQuestions(parsedQuestions.size())
                .validQuestions(valid)
                .invalidQuestions(invalid)
                .canImport(parsedQuestions.size() > 0 && invalid == 0)
                .parsedQuestions(parsedQuestions)
                .build();
    }

    @Transactional
    public void commitImport(Long deckId, List<QuestionRequest> questions) {
        // Validate deck
        Deck deck = deckRepository.findById(deckId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bộ đề với ID: " + deckId));
        
        // Save all questions using existing logic to ensure consistency
        for (QuestionRequest q : questions) {
            questionService.createQuestion(deckId, q);
        }
    }
}
