import React from 'react';
import { Box, Typography, Button, Card, CardMedia, CardContent, CardActions, Chip } from '@material-ui/core';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import PhoneIcon from '@material-ui/icons/Phone';
import Rating from '@material-ui/lab/Rating';

import useStyles from './styles.js';

const PlaceDetails = ({ place, selected, refProp }) => {
  if (selected) refProp?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const classes = useStyles();

  let placeImage = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1650&q=80';
  if (place.photos) {
    placeImage = place.photos[0].getUrl();
  } else if (place.geometry) {
    placeImage = `https://maps.googleapis.com/maps/api/streetview?size=400x400&location=${place.geometry?.location?.lat()},${place.geometry?.location?.lng()}&key=${process.env.REACT_APP_GOOGLE_MAP_API_KEY}`;
  }

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.geometry?.location?.lat()},${place.geometry?.location?.lng()}`;

  return (
    <Card elevation={6}>
      <CardMedia
        style={{ height: 350 }}
        image={placeImage}
        title={place.name}
      />
      <CardContent>
        <Typography gutterBottom variant="h5">{place.name}</Typography>
        <Box display="flex" justifyContent="space-between" my={2}>
          <Rating name="read-only" value={Number(place.rating)} readOnly />
          <Typography component="legend">{place.num_reviews} review{place.num_reviews > 1 && 's'}</Typography>
        </Box>

        {place.price_level !== undefined && (
          <Box display="flex" justifyContent="space-between">
            <Typography component="legend">Price Level</Typography>
            <Typography gutterBottom variant="subtitle1">
              {'$'.repeat(place.price_level)}
            </Typography>
          </Box>
        )}

        {/* Google Places nearbySearch doesn't typically provide ranking, awards, or detailed cuisine without a getDetails call, but we keep the logic intact if they are provided */}
        {place.ranking && (
          <Box display="flex" justifyContent="space-between">
            <Typography component="legend">Ranking</Typography>
            <Typography gutterBottom variant="subtitle1">
              {place.ranking}
            </Typography>
          </Box>
        )}
        {place?.awards?.map((award) => (
          <Box display="flex" justifyContent="space-between" my={1} alignItems="center">
            <img src={award.images.small} alt={award.display_name} />
            <Typography variant="subtitle2" color="textSecondary">{award.display_name}</Typography>
          </Box>
        ))}
        {place?.types?.map((name) => (
          <Chip key={name} size="small" label={name.replace('_', ' ')} className={classes.chip} />
        ))}
        {place.vicinity && (
          <Typography gutterBottom variant="body2" color="textSecondary" className={classes.subtitle}>
            <LocationOnIcon />{place.vicinity}
          </Typography>
        )}
        {place.formatted_phone_number && (
          <Typography variant="body2" color="textSecondary" className={classes.spacing}>
            <PhoneIcon /> {place.formatted_phone_number}
          </Typography>
        )}
      </CardContent>
      <CardActions>
        {place.url && (
          <Button size="small" color="primary" onClick={() => window.open(place.url, '_blank')}>
            Google Maps
          </Button>
        )}
        {place.website && (
          <Button size="small" color="primary" onClick={() => window.open(place.website, '_blank')}>
            Website
          </Button>
        )}
        <Button
          size="small"
          color="primary"
          variant="contained"
          style={{ marginLeft: 'auto' }}
          onClick={() => window.open(directionsUrl, '_blank')}
        >
          📍 Get Directions
        </Button>
      </CardActions>
    </Card>
  );
};

export default PlaceDetails;
