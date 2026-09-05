package com.gridweaver.domain;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record NodeTelemetry(
        @NotBlank String nodeId,
        @NotNull NodeType nodeType,
        @Min(-90) @Max(90) double latitude,
        @Min(-180) @Max(180) double longitude,
        @Min(0) double powerKw,
        @Min(0) @Max(100) double batterySoc,
        @Min(0) @Max(100) double gridLoadPercent,
        @Min(-50) @Max(100) double temperatureC,
        @NotNull Instant timestamp,
        long sequence
) {}
