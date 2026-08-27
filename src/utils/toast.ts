import * as Burnt from 'burnt';

// Define your own custom options type
type ToastType = 'error' | 'success' | 'info';

export const showGameToast = (
  title: string,
  message: string,
  type: ToastType = 'info'
) => {
  const presetMap: Record<ToastType, 'error' | 'done' | 'none'> = {
    error: 'error',
    success: 'done',
    info: 'none',
  };

  Burnt.toast({
    title,
    message,
    preset: presetMap[type],
    duration: 3,
    haptic: type === 'error' ? 'error' : 'success',
  });
};