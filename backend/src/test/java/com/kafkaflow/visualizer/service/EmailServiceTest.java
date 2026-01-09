package com.kafkaflow.visualizer.service;

import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.mockito.Mockito.mock;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailService emailService;

    @Test
    void sendEmailWithAttachment_ShouldSendMail() throws Exception {
        // Given
        MimeMessage mimeMessage = mock(MimeMessage.class);
        given(mailSender.createMimeMessage()).willReturn(mimeMessage);

        // When
        emailService.sendEmailWithAttachment(
                "test@example.com",
                "Subject",
                "Body",
                "content".getBytes(),
                "file.txt"
        );

        // Then
        then(mailSender).should().send(mimeMessage);
    }

    @Test
    void convertMessagesToCsv_ShouldGenerateCsv() {
        // Given
        Map<String, Object> msg1 = Map.of(
                "id", 1,
                "key", "key1",
                "value", "val1",
                "topicName", "topic1"
        );
        List<Map<String, Object>> messages = List.of(msg1);

        // When
        byte[] result = emailService.convertMessagesToCsv(messages);
        String csvContent = new String(result);

        // Then
        assertThat(csvContent).contains("id,key,value,topicName");
        assertThat(csvContent).contains("1,key1,val1,topic1");
    }

    @Test
    void convertMessagesToCsv_ShouldHandleEmptyList() {
        // When
        byte[] result = emailService.convertMessagesToCsv(Collections.emptyList());

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    void convertMessagesToTxt_ShouldGenerateTxt() {
        // Given
        Map<String, Object> msg1 = Map.of(
                "id", 1,
                "topicName", "topic1",
                "value", "val1"
        );
        List<Map<String, Object>> messages = List.of(msg1);

        // When
        byte[] result = emailService.convertMessagesToTxt(messages);
        String txtContent = new String(result);

        // Then
        assertThat(txtContent).contains("ID: 1");
        assertThat(txtContent).contains("Topic: topic1");
        assertThat(txtContent).contains("Value: val1");
    }

    @Test
    void convertMessagesToJson_ShouldGenerateJson() throws Exception {
        // Given
        Map<String, Object> msg1 = Map.of("id", 1, "value", "test");
        List<Map<String, Object>> messages = List.of(msg1);

        // When
        byte[] result = emailService.convertMessagesToJson(messages);
        String jsonContent = new String(result);

        // Then
        assertThat(jsonContent).contains("\"id\" : 1");
        assertThat(jsonContent).contains("\"value\" : \"test\"");
    }
    
    @Test
    void convertMessagesToPdf_ShouldGeneratePdf() throws Exception {
        // Given
        Map<String, Object> msg1 = Map.of("id", 1, "value", "test");
        List<Map<String, Object>> messages = List.of(msg1);

        // When
        byte[] result = emailService.convertMessagesToPdf(messages);

        // Then
        assertThat(result).isNotEmpty();
        // Fix: startsWith expects a byte array or we convert result to string first, 
        // but PDF binary check is safer with byte comparison or just checking not empty for now
        // Using string conversion for simple check of PDF header
        String pdfContent = new String(result, java.nio.charset.StandardCharsets.ISO_8859_1);
        assertThat(pdfContent).startsWith("%PDF-");
    }
}
