import React from 'react';
import { Drawer, List, ListItem, ListItemText, ListItemIcon, Typography, IconButton, Divider } from '@material-ui/core';
import RoomIcon from '@material-ui/icons/Room';
import CloseIcon from '@material-ui/icons/Close';
import { useAITravel } from '../context/AITravelContext';

const PreRideLandmarkDrawer = () => {
  const { isLandmarkDrawerOpen, setIsLandmarkDrawerOpen, landmarks } = useAITravel();

  return (
    <Drawer anchor="right" open={isLandmarkDrawerOpen} onClose={() => setIsLandmarkDrawerOpen(false)}>
      <div style={{ width: 300, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Pre-Ride Landmarks</Typography>
          <IconButton onClick={() => setIsLandmarkDrawerOpen(false)}><CloseIcon /></IconButton>
        </div>
        <Divider style={{ margin: '10px 0' }} />
        {landmarks.length === 0 ? (
          <Typography variant="body2" color="textSecondary">No landmarks extracted for this route yet. Try setting a route first.</Typography>
        ) : (
          <List>
            {landmarks.map((l, index) => (
              <ListItem key={index}>
                <ListItemIcon><RoomIcon color="primary" /></ListItemIcon>
                <ListItemText primary={l.name} secondary={`${l.category} • ${l.distanceFromOriginKm} km away`} />
              </ListItem>
            ))}
          </List>
        )}
      </div>
    </Drawer>
  );
};

export default PreRideLandmarkDrawer;
