import type { MatchRange } from './text-highlight.types';

const COMBINING_MARKS = /\p{M}/gu;
const WORD_CHARACTER = /[\p{L}\p{N}]/u;

const fold = (value: string) => value.normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase();

// The folded text, with the original start and end of the character behind each folded code unit.
const foldWithIndexMap = (text: string) => {
  let folded = '';
  const starts: number[] = [];
  const ends: number[] = [];
  let index = 0;

  for (const character of text) {
    const piece = fold(character);
    for (let unit = 0; unit < piece.length; unit += 1) {
      starts.push(index);
      ends.push(index + character.length);
    }
    folded += piece;
    index += character.length;
  }

  return { folded, starts, ends };
};

const isWordStart = (folded: string, position: number) =>
  position === 0 || !WORD_CHARACTER.test(folded[position - 1]);

const findTerm = (folded: string, term: string) => {
  let first = -1;

  for (let position = folded.indexOf(term); position !== -1; ) {
    if (isWordStart(folded, position)) {
      return position;
    }
    if (first === -1) {
      first = position;
    }
    position = folded.indexOf(term, position + 1);
  }

  return first;
};

/** Sorts ranges, drops empty ones, clamps them to `length`, and merges ranges that overlap or touch. */
export const normalizeRanges = (ranges: readonly MatchRange[], length: number): MatchRange[] =>
  ranges
    .map(([start, end]) => [Math.max(0, start), Math.min(length, end)] as const)
    .filter(([start, end]) => end > start)
    .sort((a, b) => a[0] - b[0] || a[1] - b[1])
    .reduce<MatchRange[]>((merged, range) => {
      const last = merged[merged.length - 1];
      if (last && range[0] <= last[1]) {
        merged[merged.length - 1] = [last[0], Math.max(last[1], range[1])];
      } else {
        merged.push(range);
      }
      return merged;
    }, []);

/** For each term of `query`, ignoring case and accents: its first match at a word start, else its first match. */
export function getMatchRanges(text: string, query: string): MatchRange[] {
  const terms = fold(query).split(/\s+/).filter(Boolean);

  if (terms.length === 0 || text === '') {
    return [];
  }

  const { folded, starts, ends } = foldWithIndexMap(text);
  const ranges = terms.flatMap((term) => {
    const position = findTerm(folded, term);
    return position === -1 ? [] : [[starts[position], ends[position + term.length - 1]] as const];
  });

  return normalizeRanges(ranges, text.length);
}
