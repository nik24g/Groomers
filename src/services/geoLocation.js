const NodeGeocoder = require("node-geocoder");

const { Client } = require('@googlemaps/google-maps-services-js');
const googleMapsClient = new Client();

// Initialize the geocoder
const geocoder = NodeGeocoder({
  provider: 'google', // You can choose a different provider if needed
  apiKey: process.env.GOOGLE_MAP_API_KEY, // If your provider requires an API key
});

// Define an async function to get the city name from coordinates
const getCityFromCoordinates = async (latitude, longitude) => {
  try {
    const result = await geocoder.reverse({ lat: latitude, lon: longitude });
    if (result && result.length > 0) {
      const cityName = result[0].city; // Extract the city name
      return cityName;
    } else {
      throw new Error('No results found for the given coordinates.');
    }
  } catch (error) {
    console.error('Error during reverse geocoding:', error.message);
    throw error;
  }
};

function calculateDistance(lat1, lon1, lat2, lon2) {
    const earthRadius = 6371; // Radius of the Earth in kilometers

    // Convert latitude and longitude from degrees to radians
    const lat1Rad = toRadians(lat1); //user
    const lon1Rad = toRadians(lon1); //user
    const lat2Rad = toRadians(lat2);
    const lon2Rad = toRadians(lon2);

    // Haversine formula
    const dLat = lat2Rad - lat1Rad;
    const dLon = lon2Rad - lon1Rad;

    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Calculate the distance
    const distance = earthRadius * c;

    return distance;
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

// async function calculateDistanceByMaps(lat1, lon1, lat2, lon2) {
//   const client = new googleMapsServices.Client({
//     apiKey: 'AIzaSyCAQ_OT7vTNx2Io42BcX2Ee8wS0EacQrDU'
//   });
//   const origins = [lat1, lon1]
//   const destinations = [lat2, lon2]
//   // const request = {
//   //   origins,
//   //   destinations,
//   //   travelMode: 'driving',
//   //   trafficModel: 'best_guess'
//   // };
//   // const response = await client.distanceMatrix(request);
//   // Create a `google.maps.DistanceMatrixService` object.
//   const distanceMatrixService = new googlemaps.DistanceMatrixService();
//   const response = await distanceMatrixService.distanceMatrix({
//     origins,
//     destinations
//   });
//   const distance = response.rows[0].elements[0].distance;
//   return distance;
// }


const calculateDistanceByMap = async (lat1, lon1, lat2, lon2) => {
  try {
    const origin = [lat1, lon1]
    const destination = [lat2, lon2]
    const response = await googleMapsClient.directions({
      params: {
        origin: origin,
        destination: destination,
        mode: 'driving',
        key: process.env.GOOGLE_MAP_API_KEY,
      },
    });

    const route = response.data.routes[0];  
    if (route) {
      const distance = route.legs.reduce((total, leg) => total + leg.distance.value, 0);
      const miles = distance * 0.000621371;
      const kilometers = distance / 1000;

      return { miles, kilometers };
    } else {
      return { miles: 0, kilometers: 0 };
    }
  } catch (error) {
    throw error;
  }
};
module.exports = {getCityFromCoordinates, calculateDistance, calculateDistanceByMap}