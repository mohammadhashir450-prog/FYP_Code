/**
 * Mutable bridge between the sign-in page (writes) and the garage 3D scene (reads every frame).
 * Kept outside React state so typing never re-renders the canvas.
 */
export type GarageFocus = 'none' | 'text' | 'password';

export const garage = {
  mode: 'login' as 'login' | 'register',
  step: 0, // registration step 0..2
  focus: 'none' as GarageFocus,
  typing: 0, // 0..1, pulsed on keystrokes, decays in the render loop
  error: 0, // 0..1, pulsed on a failed submit
  success: 0, // 0 | 1 — celebration
  formSide: 1, // where the form sits relative to the scene (1 = right)
};

export function pulseTyping() { garage.typing = 1; }
export function pulseError() { garage.error = 1; }
