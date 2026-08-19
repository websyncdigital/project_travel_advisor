import React from 'react';
import { Drawer, Typography, IconButton, Divider, Card, CardContent, Button } from '@material-ui/core';
import { useAITravel } from '../context/AITravelContext';
import CloseIcon from '@material-ui/icons/Close';

const IsochronalSearchPanel = () => {
  const { isSearchPanelOpen, setIsSearchPanelOpen, venues, setRouteAndFetchLandmarks } = useAITravel();

  return (
    <Drawer anchor="bottom" open={isSearchPanelOpen} onClose={() => setIsSearchPanelOpen(false)}>
      <div style={{ padding: 20, maxHeight: '50vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Detour-Constrained Venues (Isochronal)</Typography>
          <div>
            <Button variant="outlined" color="primary" onClick={() => setRouteAndFetchLandmarks({})} style={{ marginRight: 10 }}>Search Route</Button>
            <IconButton onClick={() => setIsSearchPanelOpen(false)}><CloseIcon /></IconButton>
          </div>
        </div>
        <Divider style={{ margin: '10px 0' }} />
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 10 }}>
          {venues.map((v, index) => (
            <Card key={index} style={{ minWidth: 250 }}>
              <CardContent>
                <Typography variant="h6">{v.name}</Typography>
                <Typography color="textSecondary" gutterBottom>{v.category} • Rating: {v.rating}</Typography>
                <Typography variant="body2" color="error">+{v.detourTimeMinutes} min detour</Typography>
              </CardContent>
            </Card>
          ))}
          {venues.length === 0 && (
             <Typography variant="body2" color="textSecondary">Run a search along the route to see venues within detour limits.</Typography>
          )}
        </div>
      </div>
    </Drawer>
  );
};

export default IsochronalSearchPanel;
