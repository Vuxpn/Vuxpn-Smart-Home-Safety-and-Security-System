import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import HouseForm from '../../../components/home/HouseForm';

export default function HouseFormScreen() {
    const params = useLocalSearchParams();
    const homeId = params.id as string | undefined;

    return <HouseForm homeId={homeId} />;
}
