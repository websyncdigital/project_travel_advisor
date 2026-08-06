import { makeStyles } from '@material-ui/core/styles';

export default makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1), minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  loading: {
    height: '600px', display: 'flex', justifyContent: 'center', alignItems: 'center',
  },
  container: {
    padding: '25px',
  },
  marginBottom: {
    marginBottom: '30px',
  },
  list: {
    height: '75vh', overflow: 'auto',
  },
  topSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    marginTop: '20px',
    borderBottom: '1px solid #eee',
    paddingBottom: '20px',
  },
  iconsContainer: {
    display: 'flex',
    gap: '15px',
  },
  iconsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
    marginBottom: '20px',
  },
  iconItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
    opacity: 0.8,
    '&:hover': {
      opacity: 1,
    },
  },
  iconItemGrid: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    cursor: 'pointer',
    opacity: 0.8,
    '&:hover': {
      opacity: 1,
    },
  },
  iconCircle: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    marginBottom: '10px',
  },
  iconCircleGrid: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    marginRight: '15px',
  },
  iconLabel: {
    fontSize: '0.85rem',
    fontWeight: 500,
    color: '#555',
  },
  iconLabelGrid: {
    fontSize: '0.9rem',
    fontWeight: 500,
    color: '#555',
  },
  bgRestaurant: { backgroundColor: '#338140' },
  bgHotel: { backgroundColor: '#188A9D' },
  bgBar: { backgroundColor: '#C8322B' },
  bgCoffee: { backgroundColor: '#A45D17' },
  bgDefault: { backgroundColor: '#607987' },
  activeIcon: {
    opacity: 1,
    boxShadow: '0px 4px 8px rgba(0,0,0,0.2)',
  },
}));
