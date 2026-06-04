import api from "../lib/config/axios.config";
import type { PaginatedResponse } from "../lib/types/common.type";
import type { RolePayload, RoleQueryDto } from "../lib/dto/role.dto";
import type { RoleBase, RoleDetail, RoleListItem } from "../lib/types/role.type";

export const RoleService = {
    getAll: async (query?: RoleQueryDto): Promise<PaginatedResponse<RoleListItem>> => {
        const { data } = await api.get<PaginatedResponse<RoleListItem>>("/role", { params: query });
        return data;
    },

    getById: async (id: string): Promise<RoleDetail> => {
        const { data } = await api.get<RoleDetail>(`/role/${id}`);
        return data;
    },

    create: async (payload: RolePayload): Promise<RoleBase> => {
        const { data } = await api.post<RoleBase>("/role", payload);
        return data;
    },

    update: async (id: string, payload: RolePayload): Promise<RoleBase> => {
        const { data } = await api.patch<RoleBase>(`/role/${id}`, payload);
        return data;
    },

    remove: async (id: string): Promise<void> => {
        await api.delete(`/role/${id}`);
    },
};