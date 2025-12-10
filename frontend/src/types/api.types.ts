export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface ApiError {
    message: string;
    status?: number;
    errors?: Record<string, string[]>;
}

export interface PaginationParams {
    page?: number;
    page_size?: number;
}

export interface SortParams {
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface DateRangeParams {
    start_date?: string;
    end_date?: string;
}
