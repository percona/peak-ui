import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import type { SearchDialogItem, SearchDialogSelectDetails } from './search-dialog.types';

const PAGE_SIZE = 8;

type ActiveSource = 'keyboard' | 'pointer';

type Moves = Partial<Record<string, number>>;

interface ActiveOption {
  id: string | null;
  source: ActiveSource | null;
}

const NO_ACTIVE_OPTION: ActiveOption = { id: null, source: null };

interface UseSearchDialogNavigationOptions<T extends SearchDialogItem> {
  items: readonly T[];
  query: string;
  ctrlNavigation: boolean;
  onSelect: (item: T, details: SearchDialogSelectDetails) => void;
  getOptionId: (index: number) => string;
}

// The option a key moves to from `active` (-1 for none), or undefined when the key is not a move.
const getTarget = (
  event: KeyboardEvent,
  active: number,
  count: number,
  ctrlNavigation: boolean
): number | undefined => {
  const last = count - 1;
  const key = event.key ?? '';
  const { ctrlKey, metaKey } = event;
  const next = active === -1 ? 0 : (active + 1) % count;
  const previous = active === -1 ? last : (active - 1 + count) % count;

  if (metaKey && !ctrlKey) {
    const moves: Moves = { ArrowUp: 0, ArrowDown: last };
    return moves[key];
  }

  if (ctrlKey && !metaKey) {
    const moves: Moves = { Home: 0, End: last, ...(ctrlNavigation && { n: next, p: previous }) };
    return moves[key.length === 1 ? key.toLowerCase() : key];
  }

  if (ctrlKey || metaKey) {
    return undefined;
  }

  const moves: Moves = {
    ArrowDown: next,
    ArrowUp: previous,
    PageDown: Math.min(active + PAGE_SIZE, last),
    PageUp: Math.max((active === -1 ? count : active) - PAGE_SIZE, 0),
  };
  return moves[key];
};

/** Combobox keys and pointer handling for SearchDialog; focus stays in the input throughout. */
export default function useSearchDialogNavigation<T extends SearchDialogItem>({
  items,
  query,
  ctrlNavigation,
  onSelect,
  getOptionId,
}: UseSearchDialogNavigationOptions<T>) {
  const listboxRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<ActiveOption>(NO_ACTIVE_OPTION);
  const [activeQuery, setActiveQuery] = useState(query);

  const listedIndex = active.id === null ? -1 : items.findIndex((item) => item.id === active.id);
  // A new query, or the active option leaving the results, resets it rather than hiding it.
  const reset = query !== activeQuery || (active.id !== null && listedIndex === -1);
  if (reset) {
    setActiveQuery(query);
    setActive(NO_ACTIVE_OPTION);
  }
  const activeIndex = reset ? -1 : listedIndex;
  const highlightedIndex = activeIndex !== -1 ? activeIndex : items.length > 0 ? 0 : -1;
  const keyboardActive = activeIndex !== -1 && active.source === 'keyboard';

  useEffect(() => {
    if (listboxRef.current) {
      listboxRef.current.scrollTop = 0;
    }
  }, [query]);

  const activate = (index: number, source: ActiveSource) => {
    const { id } = items[index];
    setActive((current) =>
      current.id === id && current.source === source ? current : { id, source }
    );
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing || event.keyCode === 229) {
      return;
    }

    if (event.key === 'Enter') {
      const item = items[highlightedIndex];
      if (item) {
        event.preventDefault();
        onSelect(item, {
          newTab: event.metaKey || event.ctrlKey,
          trigger: 'keyboard',
          event,
        });
      }
      return;
    }

    if (items.length === 0 || event.altKey || event.shiftKey) {
      return;
    }

    const target = getTarget(event, activeIndex, items.length, ctrlNavigation);
    if (target === undefined) {
      return;
    }

    event.preventDefault();
    activate(target, 'keyboard');
    listboxRef.current?.ownerDocument
      .getElementById(getOptionId(target))
      ?.scrollIntoView?.({ block: 'nearest' });
  };

  const getOptionHandlers = (item: T, index: number) => ({
    onPointerMove: () => activate(index, 'pointer'),
    onClick: (event: MouseEvent<HTMLElement>) =>
      onSelect(item, { newTab: event.metaKey || event.ctrlKey, trigger: 'pointer', event }),
    onAuxClick: (event: MouseEvent<HTMLElement>) => {
      if (event.button === 1) {
        event.preventDefault();
        onSelect(item, { newTab: true, trigger: 'pointer', event });
      }
    },
  });

  return {
    listboxRef,
    activeIndex,
    highlightedIndex,
    keyboardActive,
    handleKeyDown,
    getOptionHandlers,
  };
}
