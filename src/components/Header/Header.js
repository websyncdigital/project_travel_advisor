import React from 'react';
import { Autocomplete } from '@react-google-maps/api';
import { Paper, Typography, InputBase, IconButton, Divider } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';

import useStyles from './styles.js';

const Header = ({ onPlaceChanged, onLoad }) => {
  const classes = useStyles();

  return (
    <Paper component="form" className={classes.floatingSearchBar}>
      <IconButton aria-label="menu">
        <MenuIcon />
      </IconButton>

      <Typography variant="h6" className={classes.title}>
        Travel Advisor
      </Typography>

      <Divider className={classes.divider} orientation="vertical" />

      <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
        <div className={classes.search}>
          <div className={classes.searchIcon}>
            <SearchIcon />
          </div>
          <InputBase placeholder="Explore new places…" classes={{ root: classes.inputRoot, input: classes.inputInput }} />
        </div>
      </Autocomplete>
    </Paper>
  );
};

export default Header;
