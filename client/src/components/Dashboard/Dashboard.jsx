import React from 'react';
import { Typography, Paper, CircularProgress, Card, CardContent, Divider, Box } from '@material-ui/core';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot } from '@material-ui/lab';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import DriveEtaIcon from '@material-ui/icons/DriveEta';
import CloudIcon from '@material-ui/icons/Cloud';
import ExploreIcon from '@material-ui/icons/Explore';

const Dashboard = ({ isLoading, startingLocationName, destinationName, weatherData, aiRecommendations }) => {
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress size="5rem" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Typography variant="h4" style={{ fontWeight: 700, color: '#f8fafc' }}>
        Trip Dashboard
      </Typography>

      {/* Weather & Context Card */}
      <Card elevation={0}>
        <CardContent>
          <Typography variant="h6" gutterBottom style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CloudIcon color="primary" /> Weather at Destination
          </Typography>
          {weatherData ? (
            <Typography variant="body1">
              Currently {Math.round(weatherData?.currentConditions?.temperatureC || 0)}°C with {weatherData?.currentConditions?.condition || 'clear skies'}.
            </Typography>
          ) : (
            <Typography variant="body2" color="textSecondary">
              Loading weather data...
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Interactive Journey Timeline */}
      <Paper elevation={0} style={{ padding: '16px', flexShrink: 0 }}>
        <Typography variant="h6" gutterBottom>
          Your Journey
        </Typography>
        <Timeline align="left" style={{ padding: 0 }}>
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot color="primary"><LocationOnIcon /></TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <Typography variant="subtitle1" fontWeight="bold">Start</Typography>
              <Typography color="textSecondary" variant="body2">{startingLocationName || 'Current Location'}</Typography>
            </TimelineContent>
          </TimelineItem>

          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot color="secondary"><DriveEtaIcon /></TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <Typography variant="subtitle1" fontWeight="bold">En Route</Typography>
              <Typography color="textSecondary" variant="body2">Travel time based on traffic</Typography>
            </TimelineContent>
          </TimelineItem>

          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot color="primary"><ExploreIcon /></TimelineDot>
            </TimelineSeparator>
            <TimelineContent>
              <Typography variant="subtitle1" fontWeight="bold">Destination</Typography>
              <Typography color="textSecondary" variant="body2">{destinationName || 'Select a destination'}</Typography>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      </Paper>

      {/* AI Smart Recommendations */}
      <Box style={{ flexGrow: 1, overflowY: 'auto' }}>
        <Typography variant="h6" gutterBottom style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ExploreIcon color="secondary" /> AI Recommendations
        </Typography>
        <Divider style={{ marginBottom: '16px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
        
        {aiRecommendations && aiRecommendations.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {aiRecommendations.map((rec, i) => (
              <Card key={i} elevation={0} style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                <CardContent>
                  <Typography variant="subtitle1" style={{ fontWeight: 600, color: '#60a5fa' }}>
                    {rec.title}
                  </Typography>
                  <Typography variant="body2" style={{ marginTop: '8px', color: '#cbd5e1' }}>
                    {rec.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Typography variant="body2" color="textSecondary">
            AI is analyzing the area to provide personalized recommendations...
          </Typography>
        )}
      </Box>
    </div>
  );
};

export default Dashboard;
