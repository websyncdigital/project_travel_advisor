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
import LocalPharmacyIcon from '@material-ui/icons/LocalPharmacy';
import LocalAtmIcon from '@material-ui/icons/LocalAtm';
import MuseumIcon from '@material-ui/icons/Museum';
import DirectionsTransitIcon from '@material-ui/icons/DirectionsTransit';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import useStyles from './styles.js';

const CategoryChips = ({ type, setType, rating, setRating }) => {
  const classes = useStyles();
  const [ratingAnchorEl, setRatingAnchorEl] = useState(null);
  const [moreAnchorEl, setMoreAnchorEl] = useState(null);

  const primaryCategories = [
    { value: 'restaurants', label: 'Restaurants', icon: <RestaurantIcon /> },
    { value: 'hotels', label: 'Hotels', icon: <HotelIcon /> },
    { value: 'attractions', label: 'Things to do', icon: <ExploreIcon /> },
    { value: 'pharmacies', label: 'Pharmacies', icon: <LocalPharmacyIcon /> },
    { value: 'atms', label: 'ATMs', icon: <LocalAtmIcon /> },
    { value: 'gas stations', label: 'Gas', icon: <LocalGasStationIcon /> },
  ];

  const secondaryCategories = [
    { value: 'museums', label: 'Museums', icon: <MuseumIcon /> },
    { value: 'transit', label: 'Transit', icon: <DirectionsTransitIcon /> },
    { value: 'bars', label: 'Bars', icon: <LocalBarIcon /> },
    { value: 'coffee', label: 'Coffee', icon: <LocalCafeIcon /> },
    { value: 'groceries', label: 'Groceries', icon: <ShoppingCartIcon /> },
    { value: 'parking lots', label: 'Parking', icon: <LocalParkingIcon /> },
    { value: 'banks', label: 'Banks', icon: <AccountBalanceIcon /> },
    { value: 'hospitals', label: 'Hospitals', icon: <LocalHospitalIcon /> },
    { value: 'post offices', label: 'Post Offices', icon: <LocalPostOfficeIcon /> },
  ];

  const isMoreActive = secondaryCategories.some((cat) => cat.value === type);

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

      {primaryCategories.map((cat) => (
        <Chip
          key={cat.value}
          icon={cat.icon}
          label={cat.label}
          onClick={() => setType(cat.value)}
          className={`${classes.chip} ${type === cat.value ? classes.chipActive : ''}`}
        />
      ))}

      <Chip
        icon={<ExpandMoreIcon />}
        label="More"
        onClick={(e) => setMoreAnchorEl(e.currentTarget)}
        className={`${classes.chip} ${isMoreActive ? classes.chipActive : ''}`}
      />

      <Menu
        anchorEl={moreAnchorEl}
        keepMounted
        open={Boolean(moreAnchorEl)}
        onClose={() => setMoreAnchorEl(null)}
      >
        {secondaryCategories.map((cat) => (
          <MenuItem
            key={cat.value}
            onClick={() => { setType(cat.value); setMoreAnchorEl(null); }}
            selected={type === cat.value}
          >
            {cat.icon}
            <span style={{ marginLeft: '10px' }}>{cat.label}</span>
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

export default CategoryChips;
