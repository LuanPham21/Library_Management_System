import api from "../lib/config/axios.config";
import type { PaginatedResponse } from "../lib/types/common.type";
import type { CategoryQueryDto, CategoryPayload } from "../lib/dto/category.dto";
import type { CategoryListItem, CategoryDetail, CategoryBase } from "../lib/types/category.type";

export const CategoryService = {
    getAll: async (query?: CategoryQueryDto): Promise<PaginatedResponse<CategoryListItem>> => {
        const { data } = await api.get<PaginatedResponse<CategoryListItem>>("/category", { params: query });
        return data;
    },

    getById: async (id: string): Promise<CategoryDetail> => {
        const { data } = await api.get<CategoryDetail>(`/category/${id}`);
        return data;
    },

    create: async (payload: CategoryPayload): Promise<CategoryBase> => {
        const { data } = await api.post<CategoryBase>("/category", payload);
        return data;
    },

    update: async (id: string, payload: CategoryPayload): Promise<CategoryBase> => {
        const { data } = await api.patch<CategoryBase>(`/category/${id}`, payload);
        return data;
    },

    remove: async (id: string): Promise<void> => {
        await api.delete(`/category/${id}`);
    },
};