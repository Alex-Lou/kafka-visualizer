package com.kafkaflow.visualizer.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportQueryRequest {

    @NotEmpty(message = "At least one topic ID is required")
    @Size(max = 200, message = "Trop de topics demandes (max 200)")
    private List<Long> topicIds;
}