import React, { useState} from "react";


import './index.css' 

function Weather() {
  const [city, setCity] = useState("");
  const [current, setCurrent] = useState(null);
  const [hourly, setHourly] = useState([]);
  const [daily, setDaily] = useState([]);
  const [loading, setLoading] = useState(false);

  

  // Convert UNIX timestamp to readable time
  const convertUnixToTime = (unix) =>
    new Date(unix * 1000).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

  // Convert UNIX timestamp to readable date
  const convertUnixToDate = (unix) =>
    new Date(unix * 1000).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });



  
  const getWeather = async () => {
    if (!city) {
      alert("Please enter a city name");
      return;
    }

    setLoading(true);
    setCurrent(null);
    setHourly([]);
    setDaily([]);

    const API_KEY = process.env.REACT_APP_WEATHER_KEY;

    try {
      // 1️⃣ Fetch current weather to get coordinates
      const basic = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      ).then((res) => res.json());

      if (!basic.coord) {
        alert(`City not found or API error: ${basic.message}`);
        setLoading(false);
        return;
      }

      const { lat, lon } = basic.coord;
      setCurrent(basic); // Save current weather

      const forecast = await fetch(
  `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
).then(res => res.json());

console.log(forecast.list); // Array of 3-hour forecasts
       setHourly(forecast.list.slice(0, 4));

       const dailyMap = {};
     
      forecast.list.forEach((item) => {
        const date = new Date(item.dt * 1000).toDateString();
        if (!dailyMap[date]) {
          dailyMap[date] = { min: item.main.temp_min, max: item.main.temp_max, weather: item.weather[0].description };
        } else {
          dailyMap[date].min = Math.min(dailyMap[date].min, item.main.temp_min);
          dailyMap[date].max = Math.max(dailyMap[date].max, item.main.temp_max);
        }
      });

      setDaily(Object.values(dailyMap).slice(0, 5));
    } catch (error) {
      console.error("Error fetching weather data:", error);
      alert("Failed to fetch weather data.");
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div className="weather-app-container">
     
     <div className="search-box-card">
       <h1 className="weather-heading">Weather App</h1>
      <input
        type="text"
        placeholder="Enter city to get weather..."
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className="search-box"
      />
      <button onClick={getWeather} className="get-weather-btn">
        Get Weather
      </button>
     </div>
     

      {loading && <p>Loading...</p>}

      {/* Current Weather */}
      {current && (
        <div  className="curent-forecast">
          <div className="current-1">
           <h2>{current.name}, {current.sys?.country}</h2>
           <p>Feels Like: {current.main?.feels_like}°C</p>
          <p>Temperature: {current.main?.temp}°C</p>
             <img
        src={`https://openweathermap.org/img/wn/${current?.weather?.[0]?.icon}@2x.png`}
        alt="icon"
      />
        </div>
           <div className="current-card-2"> 
          <p>Humidity: {current.main?.humidity}%</p>
          <p>Weather: {current.weather?.[0]?.description}</p>
          <p>Sunrise: {convertUnixToTime(current.sys?.sunrise)}</p>
          <p>Sunset: {convertUnixToTime(current.sys?.sunset)}</p>
          </div>
        </div>
      )}

      {/* Hourly Forecast */}
      {hourly.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3 className="hourly-heading">Hourly Forecast (Next 12 hours)</h3>
          <div className="daily-hourly-card">
            {hourly.map((hour, i) => (
              <div key={i} className="cards-container">
                <p>{convertUnixToTime(hour.dt)}</p>
                <p>{hour.main.temp}°C</p>
                <p>{hour.weather[0].description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Forecast */}
      {daily.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3  className="hourly-heading">Daily Forecast (Next 5 days)</h3>
          <div className="daily-hourly-card">
            {daily.map((day, i) => (
              <div key={i} className="cards-container">
                <p>{convertUnixToDate(new Date().getTime() + i * 86400000)}</p>
                <p>Min: {day.min}° / Max: {day.max}°</p>
                <p>{day.weather}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
      
  );
}




export default Weather 