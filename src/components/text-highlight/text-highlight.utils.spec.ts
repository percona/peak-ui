import { describe, expect, it } from 'vitest';
import { getMatchRanges, normalizeRanges } from './text-highlight.utils';

const marked = (text: string, query: string) =>
  getMatchRanges(text, query).map(([start, end]) => text.slice(start, end));

describe('getMatchRanges', () => {
  it('prefers a match at a word start', () => {
    expect(getMatchRanges('Banana analytics', 'ana')).toEqual([[7, 10]]);
  });

  it('falls back to the first match inside a word', () => {
    expect(getMatchRanges('Banana', 'nan')).toEqual([[2, 5]]);
  });

  it('ignores case and accents and maps back to the original indices', () => {
    expect(getMatchRanges('Médias', 'med')).toEqual([[0, 3]]);
    expect(marked('Médias', 'MED')).toEqual(['Méd']);
    expect(marked('Resume', 'résumé')).toEqual(['Resume']);
  });

  it('marks every whitespace-separated term', () => {
    expect(marked('MySQL instance summary', '  mysql   sum ')).toEqual(['MySQL', 'sum']);
  });

  it('merges ranges that overlap or touch', () => {
    expect(getMatchRanges('Realtime', 'real time')).toEqual([[0, 8]]);
    expect(getMatchRanges('Query analytics', 'query que')).toEqual([[0, 5]]);
  });

  it('treats punctuation as a word boundary', () => {
    expect(marked('real-time analytics', 'time')).toEqual(['time']);
    expect(getMatchRanges('mysql_summary', 'sum')).toEqual([[6, 9]]);
  });

  it('keeps the index map when a character folds to several code units', () => {
    expect(marked('한국 MySQL', 'my')).toEqual(['My']);
    expect(getMatchRanges('한국 MySQL', '국')).toEqual([[1, 2]]);
  });

  it('keeps characters outside the basic plane whole', () => {
    expect(marked('🚀 Launch', 'launch')).toEqual(['Launch']);
  });

  it('returns no ranges for an empty query or no match', () => {
    expect(getMatchRanges('Overview', '')).toEqual([]);
    expect(getMatchRanges('Overview', '   ')).toEqual([]);
    expect(getMatchRanges('Overview', 'xyz')).toEqual([]);
    expect(getMatchRanges('', 'a')).toEqual([]);
  });
});

describe('normalizeRanges', () => {
  it('sorts, clamps, drops empty ranges and merges', () => {
    expect(
      normalizeRanges(
        [
          [6, 20],
          [-2, 2],
          [2, 3],
          [4, 4],
        ],
        10
      )
    ).toEqual([
      [0, 3],
      [6, 10],
    ]);
  });
});
