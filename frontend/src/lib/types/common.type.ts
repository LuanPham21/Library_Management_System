export interface Timestamps {
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
}

export interface PaginationMeta {
    total: number;
    page: number;
    pageSize: number;
    totalPages?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}

export interface ApiResponse<T> {
    data: T;
    message: string;
}