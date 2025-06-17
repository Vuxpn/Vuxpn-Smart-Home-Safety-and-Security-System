export interface Device {
    _id?: string;
    deviceId: string;
    name: string;
    type: string;
    description?: string;
    state: 'ACTIVE' | 'INACTIVE';
    homeId: string;
    createdAt?: string;
    updatedAt?: string;
}
