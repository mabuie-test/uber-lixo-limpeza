import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import api from "../utils/api";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

export default function MapView({ services = [] }) {
  const [center, setCenter] = useState([-25.9692, 32.5732]);
  const [workers, setWorkers] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/workers/nearby?lng=32.5732&lat=-25.9692&maxDistance=50000");
        setWorkers(res.data || []);
      } catch (err) { console.warn(err); }
    })();
  }, []);

  return (
    <div style={{ height: "72vh", width: "100%" }}>
      <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        {services.map(s => {
          const coords = s.location?.coordinates ? [s.location.coordinates[1], s.location.coordinates[0]] : null;
          if (!coords) return null;
          return (
            <Marker key={s._id} position={coords}>
              <Popup>
                <strong>{s.type}</strong><br/>
                Status: {s.status}<br/>
                Preço: {s.price || "-"}<br/>
                {s.details && <pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(s.details)}</pre>}
              </Popup>
            </Marker>
          );
        })}

        {workers.map(w => {
          const coords = w.location?.coordinates ? [w.location.coordinates[1], w.location.coordinates[0]] : null;
          if (!coords) return null;
          return (
            <Marker key={w._id} position={coords}>
              <Popup>
                <strong>{w.userId?.name || "Prestador"}</strong><br/>
                Serviços: {w.serviceTypes?.join(", ")}<br/>
                Rating: {w.rating || 0}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

