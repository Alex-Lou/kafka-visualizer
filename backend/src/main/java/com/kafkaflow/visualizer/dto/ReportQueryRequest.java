package com.kafkaflow.visualizer.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportQueryRequest {

    @NotEmpty(message = "At least one topic ID is required")
    private List<Long> topicIds;
}