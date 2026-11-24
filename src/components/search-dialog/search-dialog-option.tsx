import { Fragment } from 'react';
import Box from '@mui/material/Box';
import { svgIconClasses } from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import ErrorOutlineOutlined from '@mui/icons-material/ErrorOutlineOutlined';
import visuallyHidden from '@mui/utils/visuallyHidden';
import TextHighlight from '../text-highlight';
import { OPTION_ICON_CLASS } from './search-dialog.styles';
import type { SearchDialogOptionProps } from './search-dialog.types';

const renderDescription = (description: string | readonly string[]) =>
  typeof description === 'string'
    ? description
    : description.map((part, index) => (
        // Breadcrumb parts can repeat, so their position is their identity.
        <Fragment key={index}>
          {index > 0 && (
            <>
              <Box component="span" sx={visuallyHidden}>
                ,
              </Box>{' '}
              <Box component="span" aria-hidden="true">
                ›
              </Box>{' '}
            </>
          )}
          {part}
        </Fragment>
      ));

const SearchDialogOption = ({
  label,
  description,
  icon,
  meta,
  status,
  query,
  labelRanges,
}: SearchDialogOptionProps) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', minWidth: 0 }}>
    <Box
      className={OPTION_ICON_CLASS}
      aria-hidden="true"
      sx={(theme) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 24,
        height: 24,
        flexShrink: 0,
        color: 'text.secondary',
        [`& .${svgIconClasses.root}`]: { fontSize: theme.typography.pxToRem(24) },
      })}
    >
      {status === 'error' ? <ErrorOutlineOutlined color="error" /> : icon}
    </Box>
    {/* 9px above and below give 40px rows with one line and 56px rows with two. */}
    <Box sx={{ flex: 1, minWidth: 0, py: '9px' }}>
      <Typography variant="body1" component="div" noWrap>
        <TextHighlight text={label} query={query} ranges={labelRanges} />
      </Typography>
      {description && description.length > 0 && (
        <Typography
          variant="helperText"
          component="div"
          noWrap
          color="text.secondary"
          sx={{ mt: '1px' }}
        >
          {renderDescription(description)}
        </Typography>
      )}
    </Box>
    {meta && (
      <Box
        aria-hidden="true"
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
          ml: 1,
          typography: 'helperText',
          color: 'text.secondary',
        }}
      >
        {meta}
      </Box>
    )}
  </Box>
);

SearchDialogOption.displayName = 'SearchDialogOption';

export default SearchDialogOption;
