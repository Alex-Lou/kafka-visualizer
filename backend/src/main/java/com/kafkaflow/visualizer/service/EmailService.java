package com.kafkaflow.visualizer.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final ObjectMapper objectMapper;

    @Autowired
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
        this.objectMapper = new ObjectMapper().enable(SerializationFeature.INDENT_OUTPUT);
    }

    public void sendEmailWithAttachment(String to, String subject, String body, byte[] attachment, String attachmentFilename) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(body, false);

        // Debug logs
        log.info("Preparing email to: {}", to);
        log.info("Attachment size: {} bytes", attachment != null ? attachment.length : "NULL");
        log.info("Attachment filename: {}", attachmentFilename);

        if (attachment != null && attachment.length > 0) {
            String contentType = getContentType(attachmentFilename);
            log.info("Content type: {}", contentType);

            helper.addAttachment(attachmentFilename, new ByteArrayResource(attachment), contentType);
            log.info("Attachment added successfully!");
        } else {
            log.warn("No attachment to add - attachment is null or empty!");
        }

        mailSender.send(message);
        log.info("Email sent successfully to {}", to);
    }

    public byte[] convertMessagesToCsv(List<Map<String, Object>> messages) {
        if (messages == null || messages.isEmpty()) {
            log.warn("No messages to convert to CSV");
            return new byte[0];
        }

        log.info("Converting {} messages to CSV", messages.size());
        StringBuilder csv = new StringBuilder("id,key,value,topicName,partition,offset,timestamp,status\n");

        for (Map<String, Object> msg : messages) {
            csv.append(msg.getOrDefault("id", "")).append(",")
                    .append(escapeCsv(msg.getOrDefault("key", ""))).append(",")
                    .append(escapeCsv(msg.getOrDefault("value", ""))).append(",")
                    .append(msg.getOrDefault("topicName", "")).append(",")
                    .append(msg.getOrDefault("partition", "")).append(",")
                    .append(msg.getOrDefault("offset", "")).append(",")
                    .append(msg.getOrDefault("timestamp", "")).append(",")
                    .append(msg.getOrDefault("status", "")).append("\n");
        }

        byte[] result = csv.toString().getBytes();
        log.info("CSV generated: {} bytes", result.length);
        return result;
    }

    public byte[] convertMessagesToJson(List<Map<String, Object>> messages) throws JsonProcessingException {
        if (messages == null || messages.isEmpty()) {
            log.warn("No messages to convert to JSON");
            return "[]".getBytes();
        }

        log.info("Converting {} messages to JSON", messages.size());
        byte[] result = objectMapper.writeValueAsBytes(messages);
        log.info("JSON generated: {} bytes", result.length);
        return result;
    }

    public byte[] convertMessagesToTxt(List<Map<String, Object>> messages) {
        if (messages == null || messages.isEmpty()) {
            log.warn("No messages to convert to TXT");
            return new byte[0];
        }

        log.info("Converting {} messages to TXT", messages.size());
        StringBuilder txt = new StringBuilder();

        for (Map<String, Object> msg : messages) {
            txt.append("--------------------------------------------------\n");
            txt.append("ID: ").append(msg.getOrDefault("id", "N/A")).append("\n");
            txt.append("Topic: ").append(msg.getOrDefault("topicName", "N/A")).append("\n");
            txt.append("Timestamp: ").append(msg.getOrDefault("timestamp", "N/A")).append("\n");
            txt.append("Key: ").append(msg.getOrDefault("key", "N/A")).append("\n");
            txt.append("Value: ").append(msg.getOrDefault("value", "N/A")).append("\n");
            txt.append("--------------------------------------------------\n\n");
        }

        byte[] result = txt.toString().getBytes();
        log.info("TXT generated: {} bytes", result.length);
        return result;
    }

    public byte[] convertMessagesToPdf(List<Map<String, Object>> messages) throws IOException {
        if (messages == null || messages.isEmpty()) {
            log.warn("No messages to convert to PDF");
            return new byte[0];
        }

        log.info("Converting {} messages to PDF", messages.size());

        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage();
            document.addPage(page);

            PDPageContentStream contentStream = new PDPageContentStream(document, page);
            contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 10);

            float y = 750;
            float margin = 50;

            for (Map<String, Object> msg : messages) {
                if (y < 50) {
                    contentStream.close();
                    page = new PDPage();
                    document.addPage(page);
                    contentStream = new PDPageContentStream(document, page);
                    contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 10);
                    y = 750;
                }

                contentStream.beginText();
                contentStream.newLineAtOffset(margin, y);
                contentStream.showText("ID: " + msg.getOrDefault("id", "N/A"));
                contentStream.newLineAtOffset(0, -15);
                contentStream.showText("Topic: " + msg.getOrDefault("topicName", "N/A"));
                contentStream.newLineAtOffset(0, -15);
                contentStream.showText("Timestamp: " + msg.getOrDefault("timestamp", "N/A"));
                contentStream.newLineAtOffset(0, -15);
                contentStream.showText("Key: " + msg.getOrDefault("key", "N/A"));
                contentStream.newLineAtOffset(0, -15);
                contentStream.showText("Value: " + msg.getOrDefault("value", "N/A"));
                contentStream.endText();
                y -= 75;
            }
            contentStream.close();

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);

            byte[] result = baos.toByteArray();
            log.info("PDF generated: {} bytes", result.length);
            return result;
        }
    }

    private String escapeCsv(Object value) {
        if (value == null) return "";
        String stringValue = value.toString();
        if (stringValue.contains(",") || stringValue.contains("\"") || stringValue.contains("\n")) {
            return "\"" + stringValue.replace("\"", "\"\"") + "\"";
        }
        return stringValue;
    }

    private String getContentType(String filename) {
        if (filename.endsWith(".csv")) return "text/csv";
        if (filename.endsWith(".json")) return "application/json";
        if (filename.endsWith(".txt")) return "text/plain";
        if (filename.endsWith(".pdf")) return "application/pdf";
        return "application/octet-stream";
    }
}
