import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Keyboard,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  ScrollViewProps,
  TextInput,
} from 'react-native';

type Props = ScrollViewProps & {
  /** Space kept between the focused input and the top of the keyboard */
  extraOffset?: number;
};

/**
 * ScrollView that keeps the focused input above the keyboard.
 * iOS uses the native keyboard insets; Android (edge-to-edge, so the window is not resized)
 * pads the content by the keyboard height and scrolls the focused input into view.
 */
export function KeyboardAwareScrollView({
  children,
  contentContainerStyle,
  extraOffset = 24,
  onScroll,
  onContentSizeChange,
  onTouchEnd,
  ...props
}: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useRef(0);
  const keyboardTop = useRef<number | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const isAndroid = Platform.OS === 'android';

  const revealFocusedInput = useCallback(() => {
    const top = keyboardTop.current;
    const input = TextInput.State.currentlyFocusedInput();
    if (top === null || !input) return;
    input.measureInWindow((_x, y, _width, height) => {
      const overlap = y + height + extraOffset - top;
      if (overlap > 0) {
        scrollRef.current?.scrollTo({ y: scrollY.current + overlap, animated: true });
      }
    });
  }, [extraOffset]);

  useEffect(() => {
    if (!isAndroid) return;
    const show = Keyboard.addListener('keyboardDidShow', (event) => {
      const { screenY, height } = event.endCoordinates;
      keyboardTop.current = screenY > 0 ? screenY : Dimensions.get('window').height - height;
      setKeyboardHeight(height);
      requestAnimationFrame(revealFocusedInput);
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      keyboardTop.current = null;
      setKeyboardHeight(0);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, [isAndroid, revealFocusedInput]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollY.current = event.nativeEvent.contentOffset.y;
    onScroll?.(event);
  };

  return (
    <ScrollView
      ref={scrollRef}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={isAndroid ? 'on-drag' : 'interactive'}
      automaticallyAdjustKeyboardInsets={!isAndroid}
      scrollEventThrottle={16}
      {...props}
      onScroll={handleScroll}
      onContentSizeChange={(width, height) => {
        // A multiline input grows while typing; keep its last line visible.
        if (isAndroid) revealFocusedInput();
        onContentSizeChange?.(width, height);
      }}
      onTouchEnd={(event) => {
        // Focus moved to another input while the keyboard was already open.
        if (isAndroid) setTimeout(revealFocusedInput, 150);
        onTouchEnd?.(event);
      }}
      contentContainerStyle={[
        contentContainerStyle,
        isAndroid && keyboardHeight > 0 ? { paddingBottom: keyboardHeight + extraOffset } : null,
      ]}
    >
      {children}
    </ScrollView>
  );
}
