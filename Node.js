
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());

let busPosition = { lat: 0, lon: 0 };
const stops = [
  { name: "정류장1", lat: 37.510284, lon: 127.059226 },
  { name: "정류장2", lat: 37.534075, lon: 126.987527 },
  { name: "정류장3", lat: 37.582360, lon: 126.981044 },
];

app.post('/updatePosition', (req, res) => {
  busPosition = req.body;
  res.send('Bus position updated');
});

app.get('/busInfo', (req, res) => {
  const busInfo = stops.map(stop => {
    const distance = calculateDistance(busPosition, stop);
    const eta = calculateETA(distance, busPosition.speed); // 버스의 현재 속도를 사용
    return { stopName: stop.name, distance, eta };
  });
  res.json({ busPosition, busInfo });
});

function calculateDistance(pos1, pos2) {
  // Haversine Formula를 사용해 거리 계산
  const R = 6371; // km
  const dLat = (pos2.lat - pos1.lat) * Math.PI / 180;
  const dLon = (pos2.lon - pos1.lon) * Math.PI / 180;
  const lat1 = pos1.lat * Math.PI / 180;
  const lat2 = pos2.lat * Math.PI / 180;

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in km
}

function calculateETA(distance, speed) {
  return (distance / speed) * 60; // ETA in minutes
}

app.listen(3000, () => console.log('Server started on port 3000'));