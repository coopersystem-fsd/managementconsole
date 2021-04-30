import axios from 'axios';

export default function reverseGeoCoding({lat, lng} = {}) {
  if (lat && lng) {
    const query = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}`;
    return axios.get(query);
  }
  return Promise.reject('lat lng missing');
}
