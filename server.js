const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');
const app = express();
const port = process.env.PORT || 3000;
​
app.use(cors());
app.use(express.json());
​
function getClientIp(req) {
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  
  if (ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }
  
  return ip;
}
​
// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
​
// Handle GET requests to /country
app.get('/country', async (req, res) => {
  try {
    const clientIp = getClientIp(req);
    console.log("Client IP:", clientIp);
​
    const geoResponse = await fetch(`https://ipwho.is/${clientIp}`);
    const geoData = await geoResponse.json();
​
    if (geoData.success !== false) {
      const country = geoData.country || "Unknown";
​
      // Use a default city for weather data, like Budapest
      const city = "Budapest";
      const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=bea2fac515d313501038b4fb3a410f92&units=metric`);
      const weatherData = await weatherResponse.json();
​
      if (weatherData.weather && weatherData.main) {
        const temperature = weatherData.main.temp;
        const weatherDescription = weatherData.weather[0].description;
        ​
    
        
        res.json({ country: country, temperature: temperature, weather: weatherDescription });
      } else {
        res.json({ country: country, temperature: "N/A", weather: "N/A" });
      }
    } else {
      console.error("Error with geo API:", geoData.message);
      res.json({ country: "Unknown", temperature: "N/A", weather: "N/A" });
    }
  } catch (error) {
    console.error("Error getting data:", error);
    res.status(500).json({ error: "Failed to get data" });
  }
});
​
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
​
