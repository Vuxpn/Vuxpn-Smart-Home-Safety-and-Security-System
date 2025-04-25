import { TouchableOpacity, View, Text } from 'react-native';

interface CheckboxProps {
    checked: boolean;
    onPress: () => void;
    label: string;
}

export function Checkbox({ checked, onPress, label }: CheckboxProps) {
    return (
        <TouchableOpacity onPress={onPress} className="flex-row items-center">
            <View className={`w-5 h-5 border border-gray-400 mr-2 ${checked ? 'bg-primary' : 'bg-white'}`}>
                {checked && <Text className="text-white text-xs text-center">✓</Text>}
            </View>
            <Text className="text-gray-700">{label}</Text>
        </TouchableOpacity>
    );
}
