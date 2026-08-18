import { makeStyles } from '@material-ui/core/styles';

export default makeStyles((theme) => ({
  floatingSearchBar: {
    display: 'flex',
    alignItems: 'center',
    padding: '4px 8px',
    borderRadius: '24px',
    minWidth: '400px',
    width: 'fit-content',
    backgroundColor: 'white',
    boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
  },
  title: {
    color: theme.palette.primary.main,
    fontWeight: 'bold',
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(2),
  },
  search: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
  },
  searchIcon: {
    padding: theme.spacing(0, 1),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#555',
  },
  inputRoot: {
    color: '#333',
    width: '100%',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    width: '100%',
  },
  divider: {
    height: 28,
    margin: 4,
  },
}));

