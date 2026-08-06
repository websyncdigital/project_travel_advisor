import React, { useState, useEffect, createRef } from 'react';
import { CircularProgress, Grid, Typography, InputLabel, MenuItem, FormControl, Select } from '@material-ui/core';

import RestaurantIcon from '@material-ui/icons/Restaurant';
import HotelIcon from '@material-ui/icons/Hotel';
import LocalBarIcon from '@material-ui/icons/LocalBar';
import LocalCafeIcon from '@material-ui/icons/LocalCafe';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import LocalGasStationIcon from '@material-ui/icons/LocalGasStation';
import LocalParkingIcon from '@material-ui/icons/LocalParking';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import LocalPostOfficeIcon from '@material-ui/icons/LocalPostOffice';
import LocalHospitalIcon from '@material-ui/icons/LocalHospital';

import PlaceDetails from '../PlaceDetails/PlaceDetails';
import useStyles from './styles.js';

const List = ({ places, type, setType, rating, setRating, childClicked, isLoading, setSelectedDestination, selectedDestination }) => {
  const [elRefs, setElRefs] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const classes = useStyles();

  useEffect(() => {
    setElRefs((refs) => Array(places.length).fill().map((_, i) => refs[i] || createRef()));
  }, [places]);

  return (
    <div className={classes.container}>
      <Typography variant="h4">Food & Dining around you</Typography>
      {isLoading ? (
        <div className={classes.loading}>
          <CircularProgress size="5rem" />
        </div>
      ) : (
        <>
          <div className={classes.iconsContainer}>
            <div className={`${classes.iconItem} ${type === 'restaurants' ? classes.activeIcon : ''}`} onClick={() => setType('restaurants')}>
              <div className={`${classes.iconCircle} ${classes.bgRestaurant}`}><RestaurantIcon /></div>
              <span className={classes.iconLabel}>Restaurants</span>
            </div>
            <div className={`${classes.iconItem} ${type === 'hotels' ? classes.activeIcon : ''}`} onClick={() => setType('hotels')}>
              <div className={`${classes.iconCircle} ${classes.bgHotel}`}><HotelIcon /></div>
              <span className={classes.iconLabel}>Hotels</span>
            </div>
            <div className={`${classes.iconItem} ${type === 'bars' ? classes.activeIcon : ''}`} onClick={() => setType('bars')}>
              <div className={`${classes.iconCircle} ${classes.bgBar}`}><LocalBarIcon /></div>
              <span className={classes.iconLabel}>Bars</span>
            </div>
            <div className={`${classes.iconItem} ${type === 'coffee' ? classes.activeIcon : ''}`} onClick={() => setType('coffee')}>
              <div className={`${classes.iconCircle} ${classes.bgCoffee}`}><LocalCafeIcon /></div>
              <span className={classes.iconLabel}>Coffee</span>
            </div>
            <div className={classes.iconItem} onClick={() => setIsExpanded(!isExpanded)}>
              <div className={`${classes.iconCircle} ${classes.bgDefault}`}>{isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}</div>
              <span className={classes.iconLabel}>{isExpanded ? 'Less' : 'More'}</span>
            </div>
          </div>

          {isExpanded && (
            <div className={classes.iconsGrid}>
              <div className={`${classes.iconItemGrid} ${type === 'banks' ? classes.activeIcon : ''}`} onClick={() => setType('banks')}>
                <div className={`${classes.iconCircleGrid} ${classes.bgDefault}`}><AccountBalanceIcon /></div>
                <span className={classes.iconLabelGrid}>Banks</span>
              </div>
              <div className={`${classes.iconItemGrid} ${type === 'gas stations' ? classes.activeIcon : ''}`} onClick={() => setType('gas stations')}>
                <div className={`${classes.iconCircleGrid} ${classes.bgDefault}`}><LocalGasStationIcon /></div>
                <span className={classes.iconLabelGrid}>Gas stations</span>
              </div>
              <div className={`${classes.iconItemGrid} ${type === 'parking lots' ? classes.activeIcon : ''}`} onClick={() => setType('parking lots')}>
                <div className={`${classes.iconCircleGrid} ${classes.bgDefault}`}><LocalParkingIcon /></div>
                <span className={classes.iconLabelGrid}>Parking Lots</span>
              </div>
              <div className={`${classes.iconItemGrid} ${type === 'groceries' ? classes.activeIcon : ''}`} onClick={() => setType('groceries')}>
                <div className={`${classes.iconCircleGrid} ${classes.bgDefault}`}><ShoppingCartIcon /></div>
                <span className={classes.iconLabelGrid}>Groceries</span>
              </div>
              <div className={`${classes.iconItemGrid} ${type === 'post offices' ? classes.activeIcon : ''}`} onClick={() => setType('post offices')}>
                <div className={`${classes.iconCircleGrid} ${classes.bgDefault}`}><LocalPostOfficeIcon /></div>
                <span className={classes.iconLabelGrid}>Post offices</span>
              </div>
              <div className={`${classes.iconItemGrid} ${type === 'hospitals' ? classes.activeIcon : ''}`} onClick={() => setType('hospitals')}>
                <div className={`${classes.iconCircleGrid} ${classes.bgDefault}`}><LocalHospitalIcon /></div>
                <span className={classes.iconLabelGrid}>Hospitals</span>
              </div>
            </div>
          )}
          <FormControl className={classes.formControl}>
            <InputLabel id="rating">Rating</InputLabel>
            <Select id="rating" value={rating} onChange={(e) => setRating(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="3">Above 3.0</MenuItem>
              <MenuItem value="4">Above 4.0</MenuItem>
              <MenuItem value="4.5">Above 4.5</MenuItem>
            </Select>
          </FormControl>
          <Grid container spacing={3} className={classes.list}>
            {places?.map((place, i) => (
              <Grid ref={elRefs[i]} key={i} item xs={12}>
                <PlaceDetails selected={Number(childClicked) === i} refProp={elRefs[i]} place={place} setSelectedDestination={setSelectedDestination} selectedDestination={selectedDestination} />
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </div>
  );
};

export default List;
