import React, { useState } from 'react';
import { Menu, MenuItem, Chip } from '@material-ui/core';

import RestaurantIcon from '@material-ui/icons/Restaurant';
import HotelIcon from '@material-ui/icons/Hotel';
import LocalBarIcon from '@material-ui/icons/LocalBar';
import LocalCafeIcon from '@material-ui/icons/LocalCafe';
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import LocalGasStationIcon from '@material-ui/icons/LocalGasStation';
import LocalParkingIcon from '@material-ui/icons/LocalParking';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import LocalPostOfficeIcon from '@material-ui/icons/LocalPostOffice';
import LocalHospitalIcon from '@material-ui/icons/LocalHospital';
import ExploreIcon from '@material-ui/icons/Explore';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';

import useStyles from './styles.js';

const CategoryChips = ({ type, setType, rating, setRating }) => {
  const classes = useStyles();
  const [ratingAnchorEl, setRatingAnchorEl] = useState(null);

  const categories = [
    { value: 'restaurants', label: 'Restaurants', icon: <RestaurantIcon /> },
    { value: 'hotels', label: 'Hotels', icon: <HotelIcon /> },
    { value: 'attractions', label: 'Things to do', icon: <ExploreIcon /> },
    { value: 'bars', label: 'Bars', icon: <LocalBarIcon /> },
    { value: 'coffee', label: 'Coffee', icon: <LocalCafeIcon /> },
    { value: 'groceries', label: 'Groceries', icon: <ShoppingCartIcon /> },
    { value: 'gas stations', label: 'Gas', icon: <LocalGasStationIcon /> },
    { value: 'parking lots', label: 'Parking', icon: <LocalParkingIcon /> },
    { value: 'banks', label: 'Banks', icon: <AccountBalanceIcon /> },
    { value: 'hospitals', label: 'Hospitals', icon: <LocalHospitalIcon /> },
    { value: 'post offices', label: 'Post Offices', icon: <LocalPostOfficeIcon /> },
  ];

  return (
    <div className={classes.chipsContainer}>
      <Chip
        icon={<ThumbUpIcon style={{ fontSize: '16px' }} />}
        label={rating ? `Rating: ${rating}+` : 'Any Rating'}
        onClick={(e) => setRatingAnchorEl(e.currentTarget)}
        className={`${classes.chip} ${rating ? classes.chipActive : ''}`}
        color={rating ? 'primary' : 'default'}
      />

      <Menu
        anchorEl={ratingAnchorEl}
        keepMounted
        open={Boolean(ratingAnchorEl)}
        onClose={() => setRatingAnchorEl(null)}
      >
        <MenuItem onClick={() => { setRating(''); setRatingAnchorEl(null); }}>All Ratings</MenuItem>
        <MenuItem onClick={() => { setRating('3'); setRatingAnchorEl(null); }}>Above 3.0</MenuItem>
        <MenuItem onClick={() => { setRating('4'); setRatingAnchorEl(null); }}>Above 4.0</MenuItem>
        <MenuItem onClick={() => { setRating('4.5'); setRatingAnchorEl(null); }}>Above 4.5</MenuItem>
      </Menu>

      {categories.map((cat) => (
        <Chip
          key={cat.value}
          icon={cat.icon}
          label={cat.label}
          onClick={() => setType(cat.value)}
          className={`${classes.chip} ${type === cat.value ? classes.chipActive : ''}`}
          color={type === cat.value ? 'primary' : 'default'}
        />
      ))}
    </div>
  );
};

export default CategoryChips;
