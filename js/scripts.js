mapboxgl.accessToken = 'pk.eyJ1IjoieWFzaGJhcm90MTk5NSIsImEiOiJja2xiZnpzNm0ybDIwMnZwZTN5YTNicTdxIn0.KFX00mfcRSTdnk9hFCVLaw';
var map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/mapbox/streets-v11', // style URL
  center: [-90.98433940235135, 40.75487934025684], // starting position [lng, lat]
  zoom: 4 // starting zoom
});

var distanceContainer = document.getElementById('distance');

// GeoJSON object to hold our measurement features
var geojson = {
  'type': 'FeatureCollection',
  'features': []
  };

// Used to draw a line between points
var linestring = {
  'type': 'Feature',
  'geometry': {
    'type': 'LineString',
    'coordinates': []
    }
  };

map.on('load', function () {
  map.addSource('geojson', {
    'type': 'geojson',
    'data': geojson
  });

// Add styles to the map
map.addLayer({
  id: 'measure-points',
  type: 'circle',
  source: 'geojson',
  paint: {
    'circle-radius': 5,
    'circle-color': '#000'
  },
  filter: ['in', '$type', 'Point']
  });
map.addLayer({
  id: 'measure-lines',
  type: 'line',
  source: 'geojson',
  layout: {
    'line-cap': 'round',
    'line-join': 'round'
  },
  paint: {
    'line-color': '#000',
    'line-width': 2.5
  },
  filter: ['in', '$type', 'LineString']
  });

map.on('click', function (e) {
  var features = map.queryRenderedFeatures(e.point, {
    layers: ['measure-points']
  });

// Remove the linestring from the group
// So we can redraw it based on the points collection
if (geojson.features.length > 1) geojson.features.pop();

// Clear the Distance container to populate it with a new value
distanceContainer.innerHTML = '';

// If a feature was clicked, remove it from the map
if (features.length) {
  var id = features[0].properties.id;
  geojson.features = geojson.features.filter(function (point) {
    return point.properties.id !== id;
  });
  } else {
    var point = {
      'type': 'Feature',
      'geometry': {
        'type': 'Point',
        'coordinates': [e.lngLat.lng, e.lngLat.lat]
      },
      'properties': {
        'id': String(new Date().getTime())
      }
    };

    geojson.features.push(point);
  }

if (geojson.features.length > 1) {
  linestring.geometry.coordinates = geojson.features.map(
    function (point) {
      return point.geometry.coordinates;
    }
  );

geojson.features.push(linestring);

// Populate the distanceContainer with total distance
var value = document.createElement('pre');
  value.textContent =
  'Total distance: ' +
  turf.length(linestring).toLocaleString() +
  'km';
  distanceContainer.appendChild(value);
}

  map.getSource('geojson').setData(geojson);
  });
});

map.on('mousemove', function (e) {
  var features = map.queryRenderedFeatures(e.point, {
    layers: ['measure-points']
  });
// UI indicator for clicking/hovering a point on the map
map.getCanvas().style.cursor = features.length
  ? 'pointer'
  : 'crosshair';
  });


map.on('load', function () {
       // Add an image to use as a custom marker
       map.loadImage(
           'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
           function (error, image) {
               if (error) throw error;
               map.addImage('custom-marker', image);
               map.addSource('dams', {
                 type: 'geojson',
                 data: 'data/Dams.geojson'
               });

               // Add a symbol layer
                map.addLayer({
                    'id': 'damLayer',
                    'type': 'symbol',
                    'source': 'dams',
                    'layout': {
                        'icon-image': 'custom-marker',
                        // get the title name from the source's "title" property
                        'text-field': ['get', 'Name'],
                        'text-font': [
                            'Open Sans Semibold',
                            'Arial Unicode MS Bold'
                        ],
                        'text-offset': [0, 1.25],
                        'text-anchor': 'top'
                    }
                });
           }
       );

       map.loadImage(
           'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
           function (error, image) {
               if (error) throw error;
               map.addImage('custom-marker1', image);
               map.addSource('ports', {
                 type: 'geojson',
                 data: 'data/Ports.geojson'
               });

               // Add a symbol layer
                map.addLayer({
                    'id': 'portLayer',
                    'type': 'symbol',
                    'source': 'ports',
                    'layout': {
                        'icon-image': 'custom-marker1',
                        // get the title name from the source's "title" property
                        'text-field': ['get', 'Name'],
                        'text-font': [
                            'Open Sans Semibold',
                            'Arial Unicode MS Bold'
                        ],
                        'text-offset': [0, 1.25],
                        'text-anchor': 'top'
                    }
                });
           }
       );
   });

   // After the last frame rendered before the map enters an "idle" state.
   map.on('idle', function () {
     // If these two layers have been added to the style,
     // add the toggle buttons.
      if (map.getLayer('damLayer') && map.getLayer('portLayer')) {
        // Enumerate ids of the layers.
        var toggleableLayerIds = ['damLayer', 'portLayer'];
        // Set up the corresponding toggle button for each layer.
      for (var i = 0; i < toggleableLayerIds.length; i++) {
        var id = toggleableLayerIds[i];
          if (!document.getElementById(id)) {
            // Create a link.
            var link = document.createElement('a');
            link.id = id;
            link.href = '#';
            link.textContent = id;
            link.className = 'active';
            // Show or hide layer when the toggle is clicked.
            link.onclick = function (e) {
              var clickedLayer = this.textContent;
              e.preventDefault();
              e.stopPropagation();

              var visibility = map.getLayoutProperty(
                clickedLayer,
                'visibility'
              );

              // Toggle layer visibility by changing the layout object's visibility property.
              if (visibility === 'visible') {
                map.setLayoutProperty(
                  clickedLayer,
                  'visibility',
                  'none'
                );
                this.className = '';
              } else {
                this.className = 'active';
                map.setLayoutProperty(
                  clickedLayer,
                  'visibility',
                  'visible'
                );
              }
            };

            var layers = document.getElementById('menu');
            layers.appendChild(link);
          }
        }
      }
    });
