import { XMLParser } from 'fast-xml-parser';
import isEmpty from 'lodash/isEmpty';
import { retryFetch } from './fetchUtils';

export function getUser() {
  const options = {
    credentials: 'include',
  };
  return retryFetch('/api/user', 2, 200, options).then(res => res.json());
}

export function getFavourites() {
  return retryFetch('/api/user/favourites', 2, 200).then(res => res.json());
}

export function updateFavourites(data) {
  const options = {
    method: 'PUT',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify(data),
  };
  return retryFetch('/api/user/favourites', 0, 0, options).then(res =>
    res.json(),
  );
}

export function deleteFavourites(data) {
  const options = {
    method: 'DELETE',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify(data),
  };
  return retryFetch('/api/user/favourites', 0, 0, options).then(res =>
    res.json(),
  );
}

const fiveMinMs = 1000 * 5 * 60;

export function getWeatherData(baseURL, time, lat, lon) {
  // Round time up to next 5 minutes
  const t = fiveMinMs * Math.ceil(time / fiveMinMs);
  const searchTime = new Date(t).toISOString();
  return retryFetch(
    `${baseURL}&latlon=${lat},${lon}&starttime=${searchTime}&endtime=${searchTime}`,
    2,
    200,
  )
    .then(res => res.text())
    .then(str => {
      const parser = new XMLParser({
        ignoreAttributes: true,
        removeNSPrefix: true,
      });
      const json = parser.parse(str);
      const data = json.FeatureCollection.member.map(elem => elem.BsWfsElement);
      return data;
    })
    .catch(err => {
      throw new Error(`Error fetching weather data: ${err}`);
    });
}
/*
export function getXTPInfoList(baseURL, data) {
  const options = {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify(data),
  };
  return retryFetch(baseURL, 0, 0, options).then(res => res.json());
}*/
export function getXTPInfoList(baseURL, data) {
/*
data:{
  edges:[
    edge_index:0, 
    legs:[
      leg_index:0,
      from:{lat: ,lon: ,name:"huuhaa"},
      to:{lat: ,lon: ,name:"huuhaa"},
      legGeometry:{...}
    ],
    ...
  ]
}
*/
	const mock_data = {infos:[]};
	if (data && data.edges && Array.isArray(data.edges) && data.edges.length > 0) {
		data.edges.forEach(e=>{
			const ei = e.edge_index;
			if (e.legs && Array.isArray(e.legs) && e.legs.length > 0) {
				e.legs.forEach(leg=>{
					mock_data.infos.push({
						edge_index: ei,
						leg_index: leg.leg_index,
						type: 'photo',
						url: 'https://picsum.photos/200',
						lat:  leg.from.lat,
						lon: leg.from.lon,
						name: leg.from.name
					});
				});
			}
		});
	}
	return this.retryFetch(
		'https://api.stackexchange.com/2.2/search?order=desc&sort=activity&intitle=perl&site=stackoverflow',
		2,
		200
	)
	.then(res => res.json())
	.then(json => {
		//console.log(['json=',json]);
		console.log(['mock_data=',mock_data]);
		return mock_data;
		//return json;
	})
	.catch(err => {
		throw new Error(`Error fetching XTP Info List: ${err}`);
	});
  /*
  return new Promise(function(resolve) {
    const promises = [];
    const mock_data = [
      {
        title:"Nauvo"
      }
    ];
    const options = {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
      },
    };
    const p = retryFetch(
      'https://api.stackexchange.com/2.2/search?order=desc&sort=activity&intitle=perl&site=stackoverflow',
      options,
      2,
      200);
    promises.push(p);
    const nested=[];
    Promise.all(promises).then(res => {
      res.forEach(r=>{
        nested.push(r.json());
      });
      Promise.all(nested).then(data=>{
        resolve(mock_data);
      });
    });
  });*/
}

export function getRefPoint(origin, destination, location) {
  if (!isEmpty(origin)) {
    return origin;
  }
  if (!isEmpty(destination)) {
    return destination;
  }
  if (location && location.hasLocation) {
    return location;
  }
  return null;
}
