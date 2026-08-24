import React from 'react';
import { View, ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenContainerProps extends ViewProps {
  children: React.ReactNode;
  excludeTop?: boolean;
  excludeBottom?: boolean;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  excludeTop = false,
  excludeBottom = false,
  className = '',
  style,
  ...props
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        {
          paddingTop: excludeTop ? 0 : insets.top,
          paddingBottom: excludeBottom ? 0 : insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
        style,
      ]}
      className={`flex-1 bg-background ${className}`}
      {...props}
    >
      {children}
    </View>
  );
};