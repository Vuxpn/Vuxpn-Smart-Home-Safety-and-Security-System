import apiClient from './apiClient';

const houseService = {
    async getHomes(): Promise<any> {
        const response = await apiClient.get('/home');
        return response.data;
    },

    async getHomeById(homeId: string): Promise<any> {
        const response = await apiClient.get(`/home/${homeId}`);
        return response.data;
    },

    async createHome(homeData: any): Promise<any> {
        const response = await apiClient.post('/home/create', homeData);
        return response.data;
    },

    async updateHome(homeId: string, homeData: any): Promise<any> {
        const response = await apiClient.put(`/home/update/${homeId}`, homeData);
        return response.data;
    },

    async deleteHome(homeId: string): Promise<any> {
        const response = await apiClient.delete(`/home/delete/${homeId}`);
        return response.data;
    },

    async addMember(homeId: string, email: string): Promise<any> {
        const response = await apiClient.post(`/home/${homeId}/members`, { email });
        return response.data;
    },

    async removeMember(homeId: string, memberId: string): Promise<any> {
        const response = await apiClient.delete(`/home/${homeId}/members/${memberId}`);
        return response.data;
    },
};

export default houseService;
