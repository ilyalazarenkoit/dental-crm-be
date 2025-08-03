export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: ApiError;
    meta?: Record<string, any>;
}
export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, any>;
}
