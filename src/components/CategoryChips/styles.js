import { makeStyles } from '@material-ui/core/styles';

export default makeStyles(() => ({
  chipsContainer: {
    display: 'flex',
    overflowX: 'auto',
    gap: '10px',
    padding: '10px',
    scrollbarWidth: 'none', /* Firefox */
    '&::-webkit-scrollbar': {
      display: 'none', /* Chrome, Safari and Opera */
    },
    // Prevent text selection while scrolling
    userSelect: 'none',
  },
  chip: {
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    fontWeight: '500',
    '&:hover': {
      backgroundColor: '#f5f5f5',
    },
  },
  chipActive: {
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    fontWeight: 'bold',
    backgroundColor: '#1976d2 !important',
    color: 'white !important',
    '& *': {
      color: 'white !important',
    },
    '&:hover': {
      backgroundColor: '#115293 !important',
    },
  },
}));
