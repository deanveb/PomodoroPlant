import { View, type ViewProps} from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";

export type ThemeViewProps = ViewProps & {
    lightColor?: string;
    darkColor?: string;
}

export function ThemeView({ style, lightColor, darkColor, ...otherProps }: ThemeViewProps) {
    const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor}, 'background');

    return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}