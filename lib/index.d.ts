/**
 * Type definitions for hanspell.
 */

export interface SpellCheckTypo {
  token: string;
  suggestions: string[];
  info?: string;
}

export interface DaumTypo extends SpellCheckTypo {
  type: string;
  context: string;
}

export type NaverTypo = SpellCheckTypo;

export type CheckCallback<T extends SpellCheckTypo = SpellCheckTypo> = (
  data: T[],
) => void;
export type EndCallback = () => void;
export type ErrorCallback = (err: Error | unknown) => void;

export function spellCheckByDAUM(
  sentence: string,
  timeout: number,
  check: CheckCallback<DaumTypo>,
  end?: EndCallback | null,
  error?: ErrorCallback,
): void;

export function spellCheckByNAVER(
  sentence: string,
  timeout: number,
  check: CheckCallback<NaverTypo>,
  end?: EndCallback | null,
  error?: ErrorCallback,
): void;
