package com.kafkaflow.visualizer.util;

public class FormatUtils {

    private FormatUtils() {}

    public static String formatSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
        if (bytes < 1024 * 1024 * 1024) return String.format("%.1f MB", bytes / (1024.0 * 1024));
        return String.format("%.1f GB", bytes / (1024.0 * 1024 * 1024));
    }

    public static String formatSize(Integer bytes) {
        return bytes != null ? formatSize((long) bytes) : "0 B";
    }
}
