package com.resort.management.core.dto;

import org.springframework.data.domain.Page;
import java.util.List;

public record PaginatedResponse<T>(
    List<T> content,
    int pageNo,
    int pageSize,
    long totalElements,
    int totalPages,
    boolean last
) {
    public static <T> PaginatedResponse<T> of(Page<?> page, List<T> mappedContent) {
        return new PaginatedResponse<>(
            mappedContent,
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages(),
            page.isLast()
        );
    }
}
