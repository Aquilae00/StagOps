import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import styles from '../styles/Home.module.css';
import mapboxgl from 'mapbox-gl'; // or "const mapboxgl = require('mapbox-gl');"
import { POI } from '../utils/poi';
mapboxgl.accessToken =
  'pk.eyJ1IjoibGluYWxkaTI5MDMiLCJhIjoiY2w4ZG5xY2d5MGthYjNuazliN2V4NDF4dSJ9.k3wwFkKbJ0kJp2j-SoUSgQ';
const Home: NextPage = () => {
  const mapContainer = useRef<any>(null);
  const map = useRef<any>(null);
  const [lng, setLng] = useState(-73.039319);
  const [lat, setLat] = useState(42.062911);
  const [zoom, setZoom] = useState(16);
  useEffect(() => {
    if (map.current) return; // initialize map only once
    const mapgl = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: [lng, lat],
      zoom: zoom,
      antialias: true
    });

    const places = {
      type: 'FeatureCollection',
      features: POI.map((p) => ({
        type: 'Feature',
        properties: { description: p.name, icon: `${p.icon}-15` },
        geometry: { type: 'Point', coordinates: [p.long, p.lat] }
      }))
    };

    mapgl.on('load', () => {
      mapgl.addSource('places', {
        type: 'geojson',
        data: places
      });

      mapgl.addLayer({
        id: 'poi-labels',
        type: 'symbol',
        source: 'places',
        layout: {
          'text-field': ['get', 'description'],
          'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
          'text-radial-offset': 0.5,
          'text-justify': 'auto',
          'icon-image': ['get', 'icon']
        },
        paint: {
          'text-color': '#ffffff'
        }
      });
      mapgl.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14
      });
      // add the DEM source as a terrain layer with exaggerated height
      mapgl.setTerrain({ source: 'mapbox-dem', exaggeration: 1.8 });
      const layers = mapgl.getStyle().layers;
      const labelLayerId = layers.find(
        (layer) => layer.type === 'symbol' && layer.layout['text-field']
      )?.id;

      // mapgl.addLayer(
      //   {
      //     id: 'add-3d-buildings',
      //     source: 'composite',
      //     'source-layer': 'building',
      //     filter: ['==', 'extrude', 'true'],
      //     type: 'fill-extrusion',
      //     minzoom: 15,
      //     paint: {
      //       'fill-extrusion-color': '#aaa',

      //       // Use an 'interpolate' expression to
      //       // add a smooth transition effect to
      //       // the buildings as the user zooms in.
      //       'fill-extrusion-height': [
      //         'interpolate',
      //         ['linear'],
      //         ['zoom'],
      //         15,
      //         0,
      //         15.05,
      //         ['get', 'height']
      //       ],
      //       'fill-extrusion-base': [
      //         'interpolate',
      //         ['linear'],
      //         ['zoom'],
      //         15,
      //         0,
      //         15.05,
      //         ['get', 'min_height']
      //       ],
      //       'fill-extrusion-opacity': 0.6
      //     }
      //   },
      //   labelLayerId
      // );
    });
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      // When active the map will receive updates to the device's location as it changes.
      trackUserLocation: true,
      // Draw an arrow next to the location dot to indicate which direction the device is heading.
      showUserHeading: true
    });
    mapgl.addControl(geolocate);
    geolocate.on('geolocate', (data) => {
      console.log(data);
    });
    // Set marker options.
    // POI.forEach((p) => {
    //   const popup = new mapboxgl.Popup({ offset: 25 }).setText(p.name);
    //   new mapboxgl.Marker({
    //     color: '#FFFFFF',
    //     draggable: true
    //   })
    //     .setLngLat([p.long, p.lat])
    //     .setPopup(popup)
    //     .addTo(mapgl);
    // });
    map.current = mapgl;
  });
  return (
    <div>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
};

export default Home;
