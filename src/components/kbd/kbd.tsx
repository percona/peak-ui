import { forwardRef } from 'react';
import Box from '@mui/material/Box';
import type SvgIcon from '@mui/material/SvgIcon';
import visuallyHidden from '@mui/utils/visuallyHidden';
import ArrowBack from '@mui/icons-material/ArrowBack';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import ArrowForward from '@mui/icons-material/ArrowForward';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import KeyboardBackspace from '@mui/icons-material/KeyboardBackspace';
import KeyboardCommandKey from '@mui/icons-material/KeyboardCommandKey';
import KeyboardControlKey from '@mui/icons-material/KeyboardControlKey';
import KeyboardOptionKey from '@mui/icons-material/KeyboardOptionKey';
import KeyboardReturn from '@mui/icons-material/KeyboardReturn';
import KeyboardTab from '@mui/icons-material/KeyboardTab';
import { mergeSx } from '@/utils';
import { kbdCapSx, kbdRootSx, kbdSymbolSx } from './kbd.styles';
import type { KbdProps } from './kbd.types';

// Symbols drawn as icons, with the name a screen reader reads for them.
const SYMBOLS: Record<string, { Icon: typeof SvgIcon; name: string }> = {
  '⌘': { Icon: KeyboardCommandKey, name: 'Command' },
  '⌥': { Icon: KeyboardOptionKey, name: 'Option' },
  '⌃': { Icon: KeyboardControlKey, name: 'Control' },
  '↑': { Icon: ArrowUpward, name: 'Up arrow' },
  '↓': { Icon: ArrowDownward, name: 'Down arrow' },
  '←': { Icon: ArrowBack, name: 'Left arrow' },
  '→': { Icon: ArrowForward, name: 'Right arrow' },
  '↵': { Icon: KeyboardReturn, name: 'Enter' },
  '⏎': { Icon: KeyboardReturn, name: 'Enter' },
  '⇥': { Icon: KeyboardTab, name: 'Tab' },
  '⌫': { Icon: KeyboardBackspace, name: 'Backspace' },
};

const Kbd = forwardRef<HTMLElement, KbdProps>(({ keys, label, sx, ...rest }, ref) => {
  const caps = typeof keys === 'string' ? [keys] : keys;

  return (
    <Box ref={ref} component="kbd" sx={mergeSx(kbdRootSx, sx)} {...rest}>
      {caps.map((key, index) => {
        const symbol = SYMBOLS[key];

        return (
          <Box
            // Caps can repeat within a chord, so their position is their identity.
            key={index}
            component="kbd"
            aria-hidden={label ? true : undefined}
            sx={kbdCapSx}
          >
            {symbol ? (
              <>
                <symbol.Icon sx={kbdSymbolSx} />
                {!label && (
                  <Box component="span" sx={visuallyHidden}>
                    {symbol.name}
                  </Box>
                )}
              </>
            ) : (
              key
            )}
          </Box>
        );
      })}
      {label && (
        <Box component="span" sx={visuallyHidden}>
          {label}
        </Box>
      )}
    </Box>
  );
});

Kbd.displayName = 'Kbd';

export default Kbd;
