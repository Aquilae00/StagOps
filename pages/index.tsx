import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import styles from '../styles/Home.module.css';
import mapboxgl from 'mapbox-gl'; // or "const mapboxgl = require('mapbox-gl');"
import { POI } from '../utils/poi';
import { AiOutlineMenu } from 'react-icons/ai';
import { FaUserSecret } from 'react-icons/fa';
mapboxgl.accessToken =
  'pk.eyJ1IjoibGluYWxkaTI5MDMiLCJhIjoiY2w4ZG5xY2d5MGthYjNuazliN2V4NDF4dSJ9.k3wwFkKbJ0kJp2j-SoUSgQ';
const Home: NextPage = () => {
  const mapContainer = useRef<any>(null);
  const map = useRef<any>(null);
  const [lng, setLng] = useState(-73.039319);
  const [lat, setLat] = useState(42.062911);
  const [zoom, setZoom] = useState(16);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [useAlias, setUseAlias] = useState(false);

  const places = useMemo(
    () => ({
      type: 'FeatureCollection',
      features: POI.map((p) => ({
        type: 'Feature',
        properties: { description: p.name, icon: `${p.icon}-15` },
        geometry: { type: 'Point', coordinates: [p.long, p.lat] }
      }))
    }),
    []
  );
  const places2 = useMemo(
    () => ({
      type: 'FeatureCollection',
      features: POI.map((p) => ({
        type: 'Feature',
        properties: { description: p.alias, icon: `${p.icon}-15` },
        geometry: { type: 'Point', coordinates: [p.long, p.lat] }
      }))
    }),
    []
  );

  useEffect(() => {
    if (!map.current) return;
    const geojsonSource = map.current.getSource('places');
    if (!geojsonSource) return;
    if (useAlias) {
      geojsonSource.setData(places2);
    } else {
      geojsonSource.setData(places);
    }
  }, [places, places2, useAlias]);
  useEffect(() => {
    if (map.current) return; // initialize map only once
    const mapgl = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: [lng, lat],
      zoom: zoom,
      antialias: true
    });

    mapgl.on('load', () => {
      mapgl.addSource('places', {
        type: 'geojson',
        data: places as any
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
      mapgl.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

      // add sky styling with `setFog` that will show when the map is highly pitched
      mapgl.setFog({
        'horizon-blend': 0.3,
        color: '#f8f0e3',
        'high-color': '#add8e6',
        'space-color': '#d8f2ff',
        'star-intensity': 0.0
      } as any);
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
    map.current = mapgl;
  });
  return (
    <div className="fixed w-full h-full">
      <div ref={mapContainer} className="map-container h-screen w-screen" />

      <button
        type="button"
        className="fixed relative rounded-full bg-white p-sm left-4 bottom-12 text-black"
        onClick={() => setIsMenuExpanded(!isMenuExpanded)}>
        <AiOutlineMenu />
        {isMenuExpanded && (
          <div className="flex flex-col mb-2xs absolute bottom-full left-1/2 -translate-x-1/2">
            <button
              type="button"
              className=" rounded-full bg-white p-sm   "
              onClick={() => setUseAlias(!useAlias)}>
              <FaUserSecret className={`${useAlias ? 'text-gray-500' : ''}`} />
            </button>
          </div>
        )}
      </button>
    </div>
  );
};

export default Home;
