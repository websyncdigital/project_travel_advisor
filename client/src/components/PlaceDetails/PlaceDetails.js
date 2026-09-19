import React from 'react';
import { Box, Typography, Button, Card, CardMedia, CardContent, CardActions } from '@material-ui/core';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import PhoneIcon from '@material-ui/icons/Phone';
import Rating from '@material-ui/lab/Rating';

import useStyles from './styles.js';

const PlaceDetails = ({ place, selected, refProp, setSelectedDestination, selectedDestination, isAiPick }) => {
  React.useEffect(() => {
    if (selected) refProp?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [selected, refProp]);
  const classes = useStyles();

  let placeImage = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1650&q=80';
  if (place.photos && place.photos.length > 0) {
    if (typeof place.photos[0].getUrl === 'function') {
      placeImage = place.photos[0].getUrl();
    } else if (place.photos[0].url) {
      placeImage = place.photos[0].url;
    }
  } else if (place.geometry?.location) {
    const lat = typeof place.geometry.location.lat === 'function' ? place.geometry.location.lat() : place.geometry.location.lat;
    const lng = typeof place.geometry.location.lng === 'function' ? place.geometry.location.lng() : place.geometry.location.lng;
    if (lat && lng) {
      placeImage = `https://maps.googleapis.com/maps/api/streetview?size=400x400&location=${lat},${lng}&key=${process.env.REACT_APP_GOOGLE_MAP_API_KEY}`;
    }
  }

  return (
    <Card
      elevation={selected ? 12 : 6}
      style={{
        border: selected ? '2px solid #38bdf8' : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      <CardMedia
        style={{ height: 350 }}
        image={placeImage}
        title={place.name}
      />
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" marginBottom="8px">
          <Typography gutterBottom variant="h5" style={{ margin: 0, fontSize: '1.25rem' }}>{place.name}</Typography>
          {isAiPick && (
            <Typography variant="caption" style={{ backgroundColor: '#7c3aed', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontWeight: 600, whiteSpace: 'nowrap', marginLeft: '8px' }}>
              ✨ AI Pick
            </Typography>
          )}
        </Box>
        <Box display="flex" justifyContent="space-between" my={2}>
          <Rating name="read-only" size="small" value={Number(place.rating)} readOnly />
          <Typography component="legend">{place.num_reviews} review{place.num_reviews > 1 && 's'}</Typography>
        </Box>

        {place.price_level !== undefined && (
          <Box display="flex" justifyContent="space-between">
            <Typography component="legend">Price</Typography>
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
          color={selectedDestination?.name === place.name ? 'default' : 'secondary'}
          variant="contained"
          style={{ marginLeft: 'auto' }}
          onClick={() => {
            if (selectedDestination?.name === place.name) {
              setSelectedDestination(null); // Clear Route
            } else {
              setSelectedDestination(place); // Draw Route
            }
          }}
        >
          {selectedDestination?.name === place.name ? 'Clear Directions' : '📍 Get Directions'}
        </Button>
      </CardActions>
    </Card>
  );
};

export default PlaceDetails;
