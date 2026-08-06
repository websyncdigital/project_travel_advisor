import { makeStyles } from '@material-ui/core/styles';

export default makeStyles(() => ({
  paper: {
    padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100px',
  },
  mapContainer: {
    height: '100vh', width: '100vw',
  },
  markerContainer: {
    position: 'absolute', transform: 'translate(-50%, -50%)', zIndex: 1, '&:hover': { zIndex: 2 },
  },
  pointer: {
    cursor: 'pointer',
    width: '100%',
    height: '70px',
    objectFit: 'cover',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: '40px',
    right: '20px',
    zIndex: 5,
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  controlPaper: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
    overflow: 'hidden',
  },
  controlButton: {
    padding: '8px',
    color: '#666',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: '#f5f5f5',
      color: '#333',
    },
  },
}));
