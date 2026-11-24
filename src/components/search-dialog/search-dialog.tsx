import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CompositionEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import InputBase, { type InputBaseProps } from '@mui/material/InputBase';
import ListSubheader from '@mui/material/ListSubheader';
import Typography from '@mui/material/Typography';
import { useTheme, type Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import useForkRef from '@mui/utils/useForkRef';
import visuallyHidden from '@mui/utils/visuallyHidden';
import { NothingFoundIllustration } from '../illustrations';
import Kbd from '../kbd';
import SearchDialogOption from './search-dialog-option';
import {
  ACTIVE_ROW_BAR_WIDTH,
  ELEVATION_24,
  FORCED_COLORS_FOCUS,
  GROUP_HEADING_HEIGHT,
  keyHintLabelSx,
  LISTBOX_PADDING_BLOCK,
  keyHintSx,
  keyHintsSx,
  OPTION_ICON_CLASS,
} from './search-dialog.styles';
import type {
  SearchDialogGroup,
  SearchDialogItem,
  SearchDialogKeyHint,
  SearchDialogLabels,
  SearchDialogProps,
  SearchDialogStatus,
} from './search-dialog.types';
import useSearchDialogNavigation from './use-search-dialog-navigation';

const STATUS_DELAY = 500;

const DEFAULT_LABELS: SearchDialogLabels = {
  dialog: 'Search',
  input: 'Search',
  results: 'Results',
  instructions:
    'Type to search. Use the up and down arrow keys to browse results, and Enter to open one.',
  clear: 'Clear search',
  close: 'Close',
  noResults: (query) => `No results for “${query}”`,
};

const DEFAULT_KEY_HINTS: readonly SearchDialogKeyHint[] = [
  { keys: ['↑', '↓'], label: 'Navigate' },
  { keys: ['↵'], label: 'Open' },
  { keys: ['Esc'], label: 'Close' },
];

const mergeLabels = (labels: Partial<SearchDialogLabels> | undefined): SearchDialogLabels => ({
  ...DEFAULT_LABELS,
  ...Object.fromEntries(Object.entries(labels ?? {}).filter(([, value]) => value !== undefined)),
});

const getDefaultStatusMessage =
  (labels: SearchDialogLabels) =>
  ({ query, count, topLabel, loading }: SearchDialogStatus) => {
    if (query.trim() === '' || (loading && count === 0)) {
      return '';
    }
    if (count === 0) {
      return `${labels.noResults(query)}.`;
    }
    return count === 1 ? `1 result: ${topLabel}.` : `${count} results. Top result: ${topLabel}.`;
  };

const preventDefault = (event: MouseEvent) => event.preventDefault();

const optionSx = (theme: Theme) => ({
  display: 'flex',
  alignItems: 'center',
  minHeight: 40,
  px: 2,
  cursor: 'pointer',
  color: 'text.primary',
  '&[data-highlighted]': {
    bgcolor: 'primary.selected',
    color: 'primary.main',
    // A start bar beside the tint, which alone is too faint to mark the row (WCAG 1.4.11).
    boxShadow: `inset ${theme.direction === 'rtl' ? -ACTIVE_ROW_BAR_WIDTH : ACTIVE_ROW_BAR_WIDTH}px 0 0 ${theme.palette.primary.main}`,
    // Invisible until forced colors, which drop the tint and the bar and paint this instead.
    outline: '2px solid transparent',
    outlineOffset: -2,
    [`& .${OPTION_ICON_CLASS}`]: { color: 'primary.main' },
    '@media (forced-colors: active)': { outlineColor: 'Highlight' },
  },
});

interface Section<T extends SearchDialogItem> {
  group: SearchDialogGroup<T>;
  start: number;
}

interface SearchDialogPanelProps<T extends SearchDialogItem> extends Omit<
  SearchDialogProps<T>,
  'open' | 'labels' | 'width' | 'id' | 'slotProps'
> {
  labels: SearchDialogLabels;
  baseId: string;
  fullScreen: boolean;
  inputProps: InputBaseProps['inputProps'];
}

// Keyed per opening, so the input, the active option and the live region start afresh.
function SearchDialogPanel<T extends SearchDialogItem>({
  onClose,
  query,
  onQueryChange,
  groups,
  onSelect,
  renderOption,
  placeholder,
  labels,
  loading = false,
  loadingDelay = 300,
  getStatusMessage,
  emptyState,
  keyHints = DEFAULT_KEY_HINTS,
  ctrlNavigation = false,
  inputRef: inputRefProp,
  inputProps,
  baseId,
  fullScreen,
}: SearchDialogPanelProps<T>) {
  const listboxId = `${baseId}-listbox`;
  const instructionsId = `${baseId}-instructions`;
  const getOptionId = (index: number) => `${baseId}-option-${index}`;

  const sections = useMemo(
    () =>
      groups
        .filter((group) => group.items.length > 0)
        .reduce<Section<T>[]>((list, group) => {
          const previous = list[list.length - 1];
          const start = previous ? previous.start + previous.group.items.length : 0;
          return [...list, { group, start }];
        }, []),
    [groups]
  );
  const items = useMemo(() => sections.flatMap(({ group }) => group.items), [sections]);
  const count = items.length;

  const {
    listboxRef,
    activeIndex,
    highlightedIndex,
    keyboardActive,
    handleKeyDown,
    getOptionHandlers,
  } = useSearchDialogNavigation({ items, query, ctrlNavigation, onSelect, getOptionId });

  const inputRef = useRef<HTMLInputElement>(null);
  const handleInputRef = useForkRef(inputRef, inputRefProp);
  const lastEmitted = useRef(query);

  const emit = (value: string) => {
    if (value !== lastEmitted.current) {
      lastEmitted.current = value;
      onQueryChange(value);
    }
  };

  // The input is uncontrolled, so composition is never interrupted; outside changes are written into it.
  useEffect(() => {
    if (query === lastEmitted.current) {
      return;
    }
    lastEmitted.current = query;
    if (inputRef.current && inputRef.current.value !== query) {
      inputRef.current.value = query;
    }
  }, [query]);

  // The caret starts after a seeded query, so typing ahead from the trigger carries on in order.
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (input) {
      input.setSelectionRange(input.value.length, input.value.length);
    }
  }, []);

  const [spinnerDue, setSpinnerDue] = useState(false);
  useEffect(() => {
    if (!loading) {
      return;
    }
    const timer = setTimeout(() => setSpinnerDue(true), loadingDelay);
    return () => {
      clearTimeout(timer);
      setSpinnerDue(false);
    };
  }, [loading, loadingDelay]);

  const statusMessage = (getStatusMessage ?? getDefaultStatusMessage(labels))({
    query,
    count,
    topLabel: items[0]?.label,
    loading,
  });
  const [announcement, setAnnouncement] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setAnnouncement(statusMessage), STATUS_DELAY);
    return () => clearTimeout(timer);
  }, [query, count, loading, statusMessage]);

  const {
    onKeyDown: onInputKeyDown,
    onCompositionEnd: onInputCompositionEnd,
    ...inputAttributes
  } = inputProps ?? {};

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!(event.nativeEvent as { isComposing?: boolean }).isComposing) {
      emit(event.target.value);
    }
  };

  const handleCompositionEnd = (event: CompositionEvent<HTMLInputElement>) => {
    onInputCompositionEnd?.(event);
    emit(event.currentTarget.value);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onInputKeyDown?.(event);
    if (!event.defaultPrevented) {
      handleKeyDown(event);
    }
  };

  const handleClear = () => {
    onQueryChange('');
    inputRef.current?.focus();
  };

  const showEmptyState = query.trim() !== '' && count === 0 && !loading;

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          minHeight: 56,
          px: 2,
          flexShrink: 0,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <SearchOutlined fontSize="large" sx={{ color: 'text.secondary', flexShrink: 0 }} />
        <InputBase
          fullWidth
          autoFocus
          defaultValue={query}
          inputRef={handleInputRef}
          placeholder={placeholder}
          onChange={handleChange}
          inputProps={{
            type: 'text',
            role: 'combobox',
            'aria-label': labels.input,
            'aria-expanded': count > 0,
            'aria-controls': listboxId,
            'aria-autocomplete': 'list',
            'aria-describedby': instructionsId,
            'aria-activedescendant': keyboardActive ? getOptionId(activeIndex) : undefined,
            autoComplete: 'off',
            autoCapitalize: 'off',
            autoCorrect: 'off',
            spellCheck: false,
            enterKeyHint: 'go',
            ...inputAttributes,
            onKeyDown: handleInputKeyDown,
            onCompositionEnd: handleCompositionEnd,
          }}
          sx={{ typography: 'inputText', '& input': { p: 0, height: '1.5em' } }}
        />
        {loading && spinnerDue && (
          <CircularProgress size={20} aria-hidden="true" sx={{ flexShrink: 0 }} />
        )}
        {query !== '' && (
          <IconButton aria-label={labels.clear} onClick={handleClear} sx={FORCED_COLORS_FOCUS}>
            <CloseOutlined />
          </IconButton>
        )}
        {fullScreen && (
          <Button onClick={(event) => onClose(event, 'closeButton')} sx={FORCED_COLORS_FOCUS}>
            {labels.close}
          </Button>
        )}
      </Box>

      <Box
        ref={listboxRef}
        role="listbox"
        id={listboxId}
        aria-label={labels.results}
        aria-busy={loading || undefined}
        hidden={count === 0}
        // Clicks on the results keep focus in the input, and a middle click starts no autoscroll.
        onMouseDown={preventDefault}
        sx={(theme) => ({
          flex: '1 1 auto',
          minHeight: 0,
          maxHeight: fullScreen ? 'none' : 'min(480px, 60vh)',
          overflowY: 'auto',
          py: `${LISTBOX_PADDING_BLOCK}px`,
          scrollPaddingBlock: `${LISTBOX_PADDING_BLOCK}px`,
          // A group's first row scrolls into view with its heading above it.
          '& [role="group"] > [role="option"]:first-child': {
            scrollMarginTop: `${GROUP_HEADING_HEIGHT}px`,
          },
          scrollbarWidth: 'thin',
          scrollbarColor: `${theme.palette.divider} ${theme.palette.action.hover}`,
        })}
      >
        {sections.map(({ group, start }, sectionIndex) => {
          const headingId = `${baseId}-group-${sectionIndex}`;

          return (
            <div key={group.id} role="presentation">
              <ListSubheader
                component="div"
                id={headingId}
                aria-hidden="true"
                disableSticky
                sx={{ px: 2, bgcolor: 'background.paper' }}
              >
                {group.label}
              </ListSubheader>
              <div role="group" aria-labelledby={headingId}>
                {group.items.map((item, offset) => {
                  const index = start + offset;
                  const highlighted = index === highlightedIndex;

                  return (
                    <Box
                      key={item.id}
                      role="option"
                      id={getOptionId(index)}
                      aria-selected={keyboardActive && index === activeIndex}
                      data-highlighted={highlighted || undefined}
                      {...getOptionHandlers(item, index)}
                      sx={optionSx}
                    >
                      {renderOption?.(item, { highlighted, query }) ?? (
                        <SearchDialogOption
                          label={item.label}
                          description={item.description}
                          icon={item.icon}
                          meta={item.meta}
                          status={item.status}
                          query={query}
                          labelRanges={item.labelRanges}
                        />
                      )}
                    </Box>
                  );
                })}
              </div>
            </div>
          );
        })}
      </Box>

      {showEmptyState &&
        (emptyState ?? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              py: 4,
              px: 2,
              textAlign: 'center',
            }}
          >
            <NothingFoundIllustration sx={{ fontSize: 64 }} />
            <Typography variant="sectionHeading" component="p">
              {labels.noResults(query)}
            </Typography>
            {labels.noResultsHint && (
              <Typography variant="body2" color="text.secondary">
                {labels.noResultsHint}
              </Typography>
            )}
          </Box>
        ))}

      {keyHints !== false && keyHints.length > 0 && (
        <Box aria-hidden="true" sx={keyHintsSx}>
          {keyHints.map((hint) => (
            <Box key={hint.label} component="span" sx={keyHintSx}>
              <Kbd keys={hint.keys} />
              <Box component="span" sx={keyHintLabelSx}>
                {hint.label}
              </Box>
            </Box>
          ))}
        </Box>
      )}

      <Box component="span" id={instructionsId} aria-hidden="true" sx={visuallyHidden}>
        {labels.instructions}
      </Box>
      <Box role="status" sx={visuallyHidden}>
        {announcement}
      </Box>
    </>
  );
}

export default function SearchDialog<T extends SearchDialogItem>({
  open,
  onClose,
  labels: labelsProp,
  width = 640,
  id,
  slotProps,
  ...panelProps
}: SearchDialogProps<T>) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const generatedId = useId();
  const labels = mergeLabels(labelsProp);

  // A new key per opening, since Modal keeps the panel mounted through its exit fade (and with keepMounted).
  const [wasOpen, setWasOpen] = useState(open);
  const [opening, setOpening] = useState(0);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setOpening(opening + 1);
    }
  }

  return (
    <Dialog
      {...slotProps?.dialog}
      open={open}
      onClose={(event, reason) => onClose(event, reason)}
      maxWidth={false}
      fullScreen={fullScreen}
      transitionDuration={reduceMotion ? 0 : theme.transitions.duration.shortest}
      slotProps={{
        container: fullScreen ? undefined : { sx: { alignItems: 'flex-start' } },
        backdrop: { sx: { bgcolor: 'surfaces.backdrop' } },
        paper: {
          // Named by its label: MUI would otherwise point aria-labelledby at a title that is not there.
          'aria-labelledby': undefined,
          'aria-label': labels.dialog,
          sx: {
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            bgcolor: 'background.paper',
            // Dark mode keeps the elevation1 surface instead of MUI's lighter overlay.
            backgroundImage: 'none',
            ...(fullScreen
              ? {
                  m: 0,
                  width: '100%',
                  maxWidth: '100%',
                  height: '100%',
                  maxHeight: 'none',
                  border: 0,
                  borderRadius: 0,
                  boxShadow: 'none',
                }
              : {
                  m: 0,
                  mt: '12vh',
                  width,
                  maxWidth: 'calc(100% - 32px)',
                  maxHeight: 'calc(100% - 12vh - 16px)',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: `${theme.shape.borderRadiusMd}px`,
                  boxShadow: ELEVATION_24,
                }),
          },
        },
      }}
    >
      <SearchDialogPanel<T>
        key={opening}
        {...panelProps}
        onClose={onClose}
        labels={labels}
        baseId={id ?? generatedId}
        fullScreen={fullScreen}
        inputProps={slotProps?.input}
      />
    </Dialog>
  );
}
