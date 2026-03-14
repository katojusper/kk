import { useState, useMemo, useEffect, useRef } from "react";
import {
  FaMapMarkerAlt,
  FaPhone,
  FaSearch,
  FaClock,
  FaShieldAlt,
  FaDirections,
  FaFilter,
  FaMap,
  FaList,
  FaTimes,
  FaLayerGroup,
} from "react-icons/fa";

/* ─────────────────────────────────────────────────────────────────────────────
   STATIONS DATA – Uganda Police Force
   ───────────────────────────────────────────────────────────────────────────── */
const STATIONS = [
  /* ── KAMPALA ── */
  {
    id: 1,
    name: "Central Police Station",
    district: "Kampala",
    division: "Central",
    address: "Kampala Road, Kampala",
    phone: "0414-233-295",
    emergency: "999",
    hours: "Open 24/7",
    lat: 0.3136,
    lng: 32.5811,
    type: "Regional HQ",
  },
  {
    id: 2,
    name: "Kira Road Police Station",
    district: "Kampala",
    division: "Central",
    address: "Kira Road, Kampala",
    phone: "0414-343-088",
    emergency: "999",
    hours: "Open 24/7",
    lat: 0.3403,
    lng: 32.5895,
    type: "Division",
  },
  {
    id: 3,
    name: "Jinja Road Police Station",
    district: "Kampala",
    division: "East",
    address: "Jinja Road, Kampala",
    phone: "0414-220-202",
    emergency: "999",
    hours: "Open 24/7",
    lat: 0.3178,
    lng: 32.6001,
    type: "Division",
  },
  {
    id: 4,
    name: "Kawempe Police Station",
    district: "Kampala",
    division: "Kawempe",
    address: "Kawempe, Kampala",
    phone: "0414-532-655",
    emergency: "999",
    hours: "Open 24/7",
    lat: 0.3731,
    lng: 32.556,
    type: "Division",
  },
  {
    id: 5,
    name: "Makindye Police Station",
    district: "Kampala",
    division: "Makindye",
    address: "Makindye, Kampala",
    phone: "0414-510-311",
    emergency: "999",
    hours: "Open 24/7",
    lat: 0.2788,
    lng: 32.5894,
    type: "Division",
  },
  {
    id: 6,
    name: "Rubaga Police Station",
    district: "Kampala",
    division: "Rubaga",
    address: "Rubaga Road, Kampala",
    phone: "0414-272-491",
    emergency: "999",
    hours: "Open 24/7",
    lat: 0.3028,
    lng: 32.5532,
    type: "Division",
  },
  {
    id: 7,
    name: "Nakawa Police Station",
    district: "Kampala",
    division: "Nakawa",
    address: "Nakawa, Kampala",
    phone: "0414-220-100",
    emergency: "999",
    hours: "Open 24/7",
    lat: 0.3219,
    lng: 32.6219,
    type: "Division",
  },
  {
    id: 8,
    name: "Old Kampala Police Station",
    district: "Kampala",
    division: "Central",
    address: "Old Kampala Hill, Kampala",
    phone: "0414-251-046",
    emergency: "999",
    hours: "Open 24/7",
    lat: 0.3172,
    lng: 32.5726,
    type: "Station",
  },
  {
    id: 9,
    name: "Wandegeya Police Station",
    district: "Kampala",
    division: "Central",
    address: "Wandegeya, Kampala",
    phone: "0414-530-155",
    emergency: "999",
    hours: "Open 24/7",
    lat: 0.3386,
    lng: 32.5704,
    type: "Station",
  },
  {
    id: 10,
    name: "Katwe Police Station",
    district: "Kampala",
    division: "Makindye",
    address: "Katwe, Kampala",
    phone: "0414-271-960",
    emergency: "999",
    hours: "Open 24/7",
    lat: 0.2952,
    lng: 32.5668,
    type: "Station",
  },
  {
    id: 11,
    name: "Kabalagala Police Station",
    district: "Kampala",
    division: "Makindye",
    address: "Kabalagala, Kampala",
    phone: "0414-510-412",
    emergency: "999",
    hours: "Open 24/7",
    lat: 0.2919,
    lng: 32.5981,
    type: "Station",
  },

  /* ── WAKISO ── */
  {
    id: 12,
    name: "Entebbe Central Police Station",
    district: "Wakiso",
    division: "Entebbe",
    address: "Entebbe Road, Entebbe",
    phone: "0414-320-247",
    emergency: "999",
    hours: "Open 24/7",
    lat: 0.0512,
    lng: 32.4637,
    type: "Regional HQ",
  },
  {
    id: 13,
    name: "Wakiso Police Station",
    district: "Wakiso",
    division: "Wakiso",
    address: "Wakiso Town, Wakiso",
    phone: "0312-200-990",
    emergency: "999",
    hours: "Open 24/7",
    lat: 0.4064,
    lng: 32.4561,
    type: "Station",
  },
  {
    id: 14,
    name: "Nansana Police Station",
    district: "Wakiso",
    division: "Nansana",
    address: "Nansana Town, Wakiso",
    phone: "0414-342-109",
    emergency: "999",
    hours: "Open 24/7",
    lat: 0.3652,
    lng: 32.5238,
    type: "Station",
  },
  {
    id: 15,
    name: "Kajjansi Police Station",
    district: "Wakiso",
    division: "Entebbe",
    address: "Kajjansi, Wakiso",
    phone: "0414-200-540",
    emergency: "999",
    hours: "Open 24/7",
    lat: 0.1765,
    lng: 32.5453,
    type: "Station",
  },

  /* ── LUWEERO ── */
  {
    id: 16,
    name: "Luweero Central Police Station",
    district: "Luweero",
    division: "Luweero",
    address: "Luweero Town, Luweero District",
    phone: "0312-264-801",
    emergency: "999",
    hours: "Open 24/7",
    lat: 0.8475,
    lng: 32.4847,
    type: "Regional HQ",
  },
  {
    id: 17,
    name: "Wobulenzi Police Station",
    district: "Luweero",
    division: "Wobulenzi",
    address: "Wobulenzi Town, Luweero",
    phone: "0312-264-820",
    emergency: "999",
    hours: "Open 24/7",
    lat: 0.7269,
    lng: 32.5019,
    type: "Station",
  },
  {
    id: 18,
    name: "Zirobwe Police Station",
    district: "Luweero",
    division: "Zirobwe",
    address: "Zirobwe Town, Luweero",
    phone: "0312-264-835",
    emergency: "999",
    hours: "Mon–Sat 08:00–20:00",
    lat: 0.7849,
    lng: 32.6281,
    type: "Station",
  },
  {
    id: 19,
    name: "Kamira Police Station",
    district: "Luweero",
    division: "Kamira",
    address: "Kamira Sub-county, Luweero",
    phone: "0312-264-842",
    emergency: "999",
    hours: "Mon–Sat 08:00–18:00",
    lat: 0.9214,
    lng: 32.5662,
    type: "Station",
  },
  {
    id: 20,
    name: "Katikamu Police Station",
    district: "Luweero",
    division: "Katikamu",
    address: "Katikamu, Luweero",
    phone: "0312-264-850",
    emergency: "999",
    hours: "Mon–Sat 08:00–18:00",
    lat: 0.761,
    lng: 32.4423,
    type: "Station",
  },

  /* ── MUKONO ── */
  {
    id: 21,
    name: "Mukono Police Station",
    district: "Mukono",
    division: "Mukono",
    address: "Mukono Town, Mukono",
    phone: "0414-290-215",
    emergency: "999",
    hours: "Open 24/7",
    lat: 0.3531,
    lng: 32.7553,
    type: "Regional HQ",
  },
  {
    id: 22,
    name: "Seeta Police Station",
    district: "Mukono",
    division: "Seeta",
    address: "Seeta, Mukono",
    phone: "0414-291-010",
    emergency: "999",
    hours: "Open 24/7",
    lat: 0.3411,
    lng: 32.6812,
    type: "Station",
  },
  {
    id: 23,
    name: "Kayunga Police Station",
    district: "Kayunga",
    division: "Kayunga",
    address: "Kayunga Town, Kayunga",
    phone: "0312-270-100",
    emergency: "999",
    hours: "Open 24/7",
    lat: 0.7033,
    lng: 32.8893,
    type: "Station",
  },

  /* ── JINJA ── */
  {
    id: 24,
    name: "Jinja Central Police Station",
    district: "Jinja",
    division: "Jinja",
    address: "Main Street, Jinja",
    phone: "0434-121-300",
    emergency: "999",
    hours: "Open 24/7",
    lat: 0.4244,
    lng: 33.2041,
    type: "Regional HQ",
  },
  {
    id: 25,
    name: "Nalufenya Police Station",
    district: "Jinja",
    division: "Nalufenya",
    address: "Nalufenya, Jinja",
    phone: "0434-121-355",
    emergency: "999",
    hours: "Open 24/7",
    lat: 0.4391,
    lng: 33.2204,
    type: "Division",
  },

  /* ── MBARARA ── */
  {
    id: 26,
    name: "Mbarara Central Police Station",
    district: "Mbarara",
    division: "Mbarara",
    address: "High Street, Mbarara",
    phone: "0485-420-100",
    emergency: "999",
    hours: "Open 24/7",
    lat: -0.6062,
    lng: 30.6545,
    type: "Regional HQ",
  },
  {
    id: 27,
    name: "Rwizi Police Station",
    district: "Mbarara",
    division: "Rwizi",
    address: "Rwizi Arc, Mbarara",
    phone: "0485-421-200",
    emergency: "999",
    hours: "Open 24/7",
    lat: -0.5926,
    lng: 30.6431,
    type: "Division",
  },

  /* ── GULU ── */
  {
    id: 28,
    name: "Gulu Central Police Station",
    district: "Gulu",
    division: "Gulu",
    address: "Gulu Town, Gulu",
    phone: "0471-432-270",
    emergency: "999",
    hours: "Open 24/7",
    lat: 2.7747,
    lng: 32.299,
    type: "Regional HQ",
  },
  {
    id: 29,
    name: "Layibi Police Station",
    district: "Gulu",
    division: "Layibi",
    address: "Layibi Division, Gulu",
    phone: "0471-432-310",
    emergency: "999",
    hours: "Open 24/7",
    lat: 2.7612,
    lng: 32.2841,
    type: "Station",
  },

  /* ── MBALE ── */
  {
    id: 30,
    name: "Mbale Central Police Station",
    district: "Mbale",
    division: "Mbale",
    address: "Cathedral Avenue, Mbale",
    phone: "0454-433-570",
    emergency: "999",
    hours: "Open 24/7",
    lat: 1.0782,
    lng: 34.1754,
    type: "Regional HQ",
  },

  /* ── KABAROLE ── */
  {
    id: 31,
    name: "Fort Portal Police Station",
    district: "Kabarole",
    division: "Fort Portal",
    address: "Fort Portal Town, Kabarole",
    phone: "0483-422-222",
    emergency: "999",
    hours: "Open 24/7",
    lat: 0.6615,
    lng: 30.2746,
    type: "Regional HQ",
  },

  /* ── MASAKA ── */
  {
    id: 32,
    name: "Masaka Police Station",
    district: "Masaka",
    division: "Masaka",
    address: "Masaka Town, Masaka",
    phone: "0481-420-055",
    emergency: "999",
    hours: "Open 24/7",
    lat: -0.3397,
    lng: 31.7394,
    type: "Regional HQ",
  },
  {
    id: 33,
    name: "Nyendo Police Station",
    district: "Masaka",
    division: "Nyendo",
    address: "Nyendo, Masaka",
    phone: "0481-420-180",
    emergency: "999",
    hours: "Open 24/7",
    lat: -0.3589,
    lng: 31.7212,
    type: "Station",
  },

  /* ── LIRA ── */
  {
    id: 34,
    name: "Lira Central Police Station",
    district: "Lira",
    division: "Lira",
    address: "Lira Town, Lira",
    phone: "0473-420-100",
    emergency: "999",
    hours: "Open 24/7",
    lat: 2.2487,
    lng: 32.8997,
    type: "Regional HQ",
  },

  /* ── ARUA ── */
  {
    id: 35,
    name: "Arua Police Station",
    district: "Arua",
    division: "Arua",
    address: "Arua Town, Arua",
    phone: "0476-420-100",
    emergency: "999",
    hours: "Open 24/7",
    lat: 3.0199,
    lng: 30.9106,
    type: "Regional HQ",
  },

  /* ── SOROTI ── */
  {
    id: 36,
    name: "Soroti Police Station",
    district: "Soroti",
    division: "Soroti",
    address: "Soroti Town, Soroti",
    phone: "0454-461-133",
    emergency: "999",
    hours: "Open 24/7",
    lat: 1.715,
    lng: 33.6111,
    type: "Regional HQ",
  },

  /* ── KABALE ── */
  {
    id: 37,
    name: "Kabale Police Station",
    district: "Kabale",
    division: "Kabale",
    address: "Kabale Town, Kabale",
    phone: "0486-422-103",
    emergency: "999",
    hours: "Open 24/7",
    lat: -1.2491,
    lng: 29.9897,
    type: "Regional HQ",
  },

  /* ── TORORO ── */
  {
    id: 38,
    name: "Tororo Police Station",
    district: "Tororo",
    division: "Tororo",
    address: "Tororo Town, Tororo",
    phone: "0454-445-113",
    emergency: "999",
    hours: "Open 24/7",
    lat: 0.6924,
    lng: 34.1805,
    type: "Regional HQ",
  },

  /* ── HOIMA ── */
  {
    id: 39,
    name: "Hoima Police Station",
    district: "Hoima",
    division: "Hoima",
    address: "Hoima Town, Hoima",
    phone: "0465-440-100",
    emergency: "999",
    hours: "Open 24/7",
    lat: 1.4341,
    lng: 31.3522,
    type: "Regional HQ",
  },

  /* ── IGANGA ── */
  {
    id: 40,
    name: "Iganga Police Station",
    district: "Iganga",
    division: "Iganga",
    address: "Iganga Town, Iganga",
    phone: "0434-440-214",
    emergency: "999",
    hours: "Open 24/7",
    lat: 0.6097,
    lng: 33.4688,
    type: "Station",
  },

  /* ── MITYANA ── */
  {
    id: 41,
    name: "Mityana Police Station",
    district: "Mityana",
    division: "Mityana",
    address: "Mityana Town, Mityana",
    phone: "0312-268-100",
    emergency: "999",
    hours: "Open 24/7",
    lat: 0.4257,
    lng: 32.0244,
    type: "Regional HQ",
  },
  {
    id: 42,
    name: "Busunjju Police Station",
    district: "Mityana",
    division: "Busunjju",
    address: "Busunjju, Mityana",
    phone: "0312-268-120",
    emergency: "999",
    hours: "Mon–Sat 08:00–18:00",
    lat: 0.4541,
    lng: 31.9862,
    type: "Station",
  },

  /* ── NAKASEKE ── */
  {
    id: 43,
    name: "Nakaseke Police Station",
    district: "Nakaseke",
    division: "Nakaseke",
    address: "Nakaseke Town, Nakaseke",
    phone: "0312-264-900",
    emergency: "999",
    hours: "Open 24/7",
    lat: 0.9892,
    lng: 32.4538,
    type: "Station",
  },

  /* ── MPIGI ── */
  {
    id: 44,
    name: "Mpigi Police Station",
    district: "Mpigi",
    division: "Mpigi",
    address: "Mpigi Town, Mpigi",
    phone: "0414-200-600",
    emergency: "999",
    hours: "Open 24/7",
    lat: 0.2252,
    lng: 32.3143,
    type: "Station",
  },

  /* ── BUTEBO / PALLISA ── */
  {
    id: 45,
    name: "Pallisa Police Station",
    district: "Pallisa",
    division: "Pallisa",
    address: "Pallisa Town, Pallisa",
    phone: "0454-464-100",
    emergency: "999",
    hours: "Open 24/7",
    lat: 1.1453,
    lng: 33.7095,
    type: "Station",
  },

  /* ── KASESE ── */
  {
    id: 46,
    name: "Kasese Police Station",
    district: "Kasese",
    division: "Kasese",
    address: "Kasese Town, Kasese",
    phone: "0483-444-100",
    emergency: "999",
    hours: "Open 24/7",
    lat: 0.1826,
    lng: 30.0859,
    type: "Regional HQ",
  },

  /* ── NTUNGAMO ── */
  {
    id: 47,
    name: "Ntungamo Police Station",
    district: "Ntungamo",
    division: "Ntungamo",
    address: "Ntungamo Town, Ntungamo",
    phone: "0486-460-100",
    emergency: "999",
    hours: "Open 24/7",
    lat: -0.8834,
    lng: 30.2655,
    type: "Station",
  },

  /* ── BUSHENYI ── */
  {
    id: 48,
    name: "Bushenyi Police Station",
    district: "Bushenyi",
    division: "Bushenyi",
    address: "Bushenyi Town, Bushenyi",
    phone: "0485-440-100",
    emergency: "999",
    hours: "Open 24/7",
    lat: -0.5459,
    lng: 30.2016,
    type: "Station",
  },
];

const ALL_DISTRICTS = [
  "All Districts",
  ...Array.from(new Set(STATIONS.map((s) => s.district))).sort(),
];
const ALL_TYPES = [
  "All Types",
  ...Array.from(new Set(STATIONS.map((s) => s.type))).sort(),
];

const TYPE_COLOR = {
  "Regional HQ": "#667eea",
  Division: "#10b981",
  Station: "#f59e0b",
};

const TYPE_MARKER_COLOR = {
  "Regional HQ": "#667eea",
  Division: "#10b981",
  Station: "#f59e0b",
};

/* ─────────────────────────────────────────────────────────────────────────────
   LEAFLET MAP COMPONENT (lazy-rendered only in map view)
   ───────────────────────────────────────────────────────────────────────────── */
function StationsMap({
  stations,
  selectedStation,
  onSelectStation,
  userLocation,
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);

  // Initialize map once
  useEffect(() => {
    if (mapInstanceRef.current) return;

    // Dynamically import leaflet to avoid SSR issues
    import("leaflet").then((L) => {
      // Fix default icon paths
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      if (!mapRef.current || mapInstanceRef.current) return;

      const map = L.map(mapRef.current, {
        center: [1.3, 32.3], // Uganda center
        zoom: 7,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Add station markers
      stations.forEach((station) => {
        const color = TYPE_MARKER_COLOR[station.type] || "#667eea";

        const customIcon = L.divIcon({
          className: "",
          html: `
            <div style="
              width:32px;height:32px;border-radius:50% 50% 50% 0;
              background:${color};border:2px solid #fff;
              box-shadow:0 2px 8px rgba(0,0,0,0.35);
              transform:rotate(-45deg);
              display:flex;align-items:center;justify-content:center;
            ">
              <span style="transform:rotate(45deg);font-size:13px;">🛡️</span>
            </div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -34],
        });

        const marker = L.marker([station.lat, station.lng], {
          icon: customIcon,
        })
          .addTo(map)
          .bindPopup(
            `<div style="min-width:200px;font-family:sans-serif;">
              <strong style="font-size:0.9rem;">${station.name}</strong><br/>
              <span style="font-size:0.75rem;color:#6b7280;">
                ${station.district} • ${station.division} Division
              </span><br/><br/>
              <span style="font-size:0.78rem;">📍 ${station.address}</span><br/>
              <span style="font-size:0.78rem;">📞 ${station.phone}</span><br/>
              <span style="font-size:0.78rem;">🕐 ${station.hours}</span><br/><br/>
              <a href="tel:${station.phone}" style="
                display:inline-block;padding:0.3rem 0.7rem;background:#10b981;
                color:#fff;border-radius:999px;font-size:0.75rem;font-weight:600;
                text-decoration:none;margin-right:0.35rem;">📞 Call</a>
              <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(station.name + ", " + station.address)}"
                target="_blank" rel="noopener" style="
                display:inline-block;padding:0.3rem 0.7rem;background:#4facfe;
                color:#fff;border-radius:999px;font-size:0.75rem;font-weight:600;
                text-decoration:none;">🗺 Directions</a>
            </div>`,
            { maxWidth: 280 },
          );

        marker.on("click", () => onSelectStation(station));
        markersRef.current.push({ id: station.id, marker });
      });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = [];
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pan to selected station
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedStation) return;
    import("leaflet").then(() => {
      mapInstanceRef.current.flyTo(
        [selectedStation.lat, selectedStation.lng],
        14,
        { duration: 0.8 },
      );
      const found = markersRef.current.find((m) => m.id === selectedStation.id);
      if (found) found.marker.openPopup();
    });
  }, [selectedStation]);

  // Show/update user location marker
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation) return;
    import("leaflet").then((L) => {
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      } else {
        const userIcon = L.divIcon({
          className: "",
          html: `<div style="width:16px;height:16px;border-radius:50%;background:#3b82f6;border:3px solid #fff;box-shadow:0 0 0 3px rgba(59,130,246,0.35);"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
          icon: userIcon,
        })
          .addTo(mapInstanceRef.current)
          .bindPopup("<strong>Your Location</strong>");
        mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 12, {
          duration: 1,
        });
      }
    });
  }, [userLocation]);

  return (
    <div
      style={{
        position: "relative",
        borderRadius: "1rem",
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
      }}
    >
      <div ref={mapRef} style={{ width: "100%", height: 500 }} />
      {/* Legend */}
      <div
        style={{
          position: "absolute",
          bottom: 16,
          left: 16,
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(8px)",
          borderRadius: "0.75rem",
          padding: "0.65rem 0.85rem",
          boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
          zIndex: 1000,
          fontSize: "0.72rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.3rem",
        }}
      >
        <div
          style={{
            fontWeight: 700,
            fontSize: "0.75rem",
            marginBottom: "0.2rem",
          }}
        >
          🗺 Legend
        </div>
        {Object.entries(TYPE_MARKER_COLOR).map(([type, color]) => (
          <div
            key={type}
            style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: color,
                flexShrink: 0,
              }}
            />
            <span>{type}</span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#3b82f6",
              flexShrink: 0,
            }}
          />
          <span>Your Location</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────────────────────────────────────────── */
export function SearchStationsPage() {
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("All Districts");
  const [type, setType] = useState("All Types");
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [viewMode, setViewMode] = useState("list"); // "list" | "map"
  const [selectedStation, setSelectedStation] = useState(null);
  const [leafletCssLoaded, setLeafletCssLoaded] = useState(false);

  // Load Leaflet CSS dynamically
  useEffect(() => {
    if (leafletCssLoaded) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    link.onload = () => setLeafletCssLoaded(true);
    document.head.appendChild(link);
    return () => {
      // keep CSS loaded between page navigations
    };
  }, [leafletCssLoaded]);

  /* ── geolocation ── */
  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocating(false);
      },
      (err) => {
        setLocationError("Could not detect location: " + err.message);
        setLocating(false);
      },
      { timeout: 10000 },
    );
  };

  /* ── Haversine distance ── */
  const calcDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  /* ── filtered + sorted list ── */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = STATIONS.filter((s) => {
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.district.toLowerCase().includes(q) ||
        s.division.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q);
      const matchDistrict =
        district === "All Districts" || s.district === district;
      const matchType = type === "All Types" || s.type === type;
      return matchSearch && matchDistrict && matchType;
    });

    if (userLocation) {
      result = result
        .map((s) => ({
          ...s,
          distance: calcDistance(
            userLocation.lat,
            userLocation.lng,
            s.lat,
            s.lng,
          ),
        }))
        .sort((a, b) => a.distance - b.distance);
    }

    return result;
  }, [search, district, type, userLocation]);

  const openDirections = (station) => {
    const query = encodeURIComponent(`${station.name}, ${station.address}`);
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${query}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <div className="rc-page-container">
      <h2 className="rc-page-title">
        <FaShieldAlt style={{ marginRight: "0.5rem", display: "inline" }} />
        Search Police Stations
      </h2>
      <p className="rc-page-subtitle">
        Find Uganda Police Force stations by name, district, or division. Toggle
        the <strong>Map</strong> view to see pins on a live OpenStreetMap.
      </p>

      {/* ── View mode toggle ── */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1rem",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <button
          type="button"
          onClick={() => setViewMode("list")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.5rem 1.1rem",
            borderRadius: 999,
            border: "1px solid #d1d5db",
            background:
              viewMode === "list"
                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                : "#f9fafb",
            color: viewMode === "list" ? "#fff" : "#111827",
            cursor: "pointer",
            fontSize: "0.85rem",
            fontWeight: 600,
            transition: "all 0.2s",
          }}
        >
          <FaList style={{ fontSize: "0.8rem" }} /> List View
        </button>
        <button
          type="button"
          onClick={() => setViewMode("map")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.5rem 1.1rem",
            borderRadius: 999,
            border: "1px solid #d1d5db",
            background:
              viewMode === "map"
                ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                : "#f9fafb",
            color: viewMode === "map" ? "#fff" : "#111827",
            cursor: "pointer",
            fontSize: "0.85rem",
            fontWeight: 600,
            transition: "all 0.2s",
          }}
        >
          <FaMap style={{ fontSize: "0.8rem" }} /> Map View
        </button>
      </div>

      {/* ── Search bar ── */}
      <div
        style={{ position: "relative", maxWidth: 520, marginBottom: "0.75rem" }}
      >
        <FaSearch
          style={{
            position: "absolute",
            left: "0.75rem",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#9ca3af",
            pointerEvents: "none",
          }}
        />
        <input
          className="rc-input"
          type="search"
          placeholder="Search by name, district, or division…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: "2.5rem", borderRadius: 999, width: "100%" }}
        />
      </div>

      {/* ── Toolbar: filters + locate ── */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.5rem 1rem",
            borderRadius: 999,
            border: "1px solid #d1d5db",
            background: showFilters
              ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              : "#f9fafb",
            color: showFilters ? "#fff" : "#111827",
            cursor: "pointer",
            fontSize: "0.85rem",
            fontWeight: 500,
            transition: "all 0.2s",
          }}
        >
          <FaFilter style={{ fontSize: "0.75rem" }} />
          Filters
          {(district !== "All Districts" || type !== "All Types") && (
            <span
              style={{
                background: "#ef4444",
                color: "#fff",
                borderRadius: "50%",
                width: 16,
                height: 16,
                fontSize: "0.65rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
              }}
            >
              !
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={detectLocation}
          disabled={locating}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.5rem 1rem",
            borderRadius: 999,
            border: "1px solid #d1d5db",
            background: userLocation ? "#d1fae5" : "#f9fafb",
            color: userLocation ? "#065f46" : "#111827",
            cursor: locating ? "not-allowed" : "pointer",
            fontSize: "0.85rem",
            fontWeight: 500,
            transition: "all 0.2s",
          }}
        >
          <FaMapMarkerAlt
            style={{
              fontSize: "0.8rem",
              color: userLocation ? "#10b981" : "#9ca3af",
            }}
          />
          {locating
            ? "Detecting…"
            : userLocation
              ? "Near me ✓"
              : "Sort by distance"}
        </button>

        {userLocation && (
          <button
            type="button"
            onClick={() => setUserLocation(null)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              padding: "0.5rem 0.9rem",
              borderRadius: 999,
              border: "1px solid #fee2e2",
              background: "#fff5f5",
              color: "#dc2626",
              cursor: "pointer",
              fontSize: "0.8rem",
              transition: "all 0.2s",
            }}
          >
            <FaTimes style={{ fontSize: "0.7rem" }} /> Clear location
          </button>
        )}

        <span
          style={{
            marginLeft: "auto",
            fontSize: "0.8rem",
            color: "#6b7280",
            fontWeight: 500,
          }}
        >
          <FaLayerGroup
            style={{ marginRight: "0.3rem", display: "inline", opacity: 0.6 }}
          />
          {filtered.length} station{filtered.length !== 1 ? "s" : ""} found
        </span>
      </div>

      {/* ── Filter panel ── */}
      {showFilters && (
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            flexWrap: "wrap",
            marginBottom: "1rem",
            padding: "1rem",
            background: "rgba(255,255,255,0.92)",
            borderRadius: "1rem",
            border: "1px solid rgba(102,126,234,0.15)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
              flex: "1 1 180px",
            }}
          >
            <label
              style={{ fontSize: "0.78rem", fontWeight: 600, color: "#374151" }}
            >
              District
            </label>
            <select
              className="rc-select"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              style={{ fontSize: "0.875rem" }}
            >
              {ALL_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
              flex: "1 1 180px",
            }}
          >
            <label
              style={{ fontSize: "0.78rem", fontWeight: 600, color: "#374151" }}
            >
              Station Type
            </label>
            <select
              className="rc-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{ fontSize: "0.875rem" }}
            >
              {ALL_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button
              type="button"
              onClick={() => {
                setDistrict("All Districts");
                setType("All Types");
              }}
              style={{
                padding: "0.55rem 1.1rem",
                borderRadius: 999,
                border: "1px solid #d1d5db",
                background: "#f9fafb",
                cursor: "pointer",
                fontSize: "0.8rem",
                transition: "all 0.2s",
              }}
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {locationError && (
        <p
          style={{
            color: "#dc2626",
            fontSize: "0.875rem",
            marginBottom: "0.75rem",
          }}
        >
          {locationError}
        </p>
      )}

      {/* ── District quick-filter chips ── */}
      <div
        style={{
          display: "flex",
          gap: "0.4rem",
          flexWrap: "wrap",
          marginBottom: "1rem",
        }}
      >
        {[
          "All Districts",
          "Kampala",
          "Luweero",
          "Wakiso",
          "Mukono",
          "Jinja",
          "Mbarara",
          "Gulu",
          "Lira",
        ].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDistrict(d)}
            style={{
              padding: "0.3rem 0.75rem",
              borderRadius: "999px",
              fontSize: "0.78rem",
              fontWeight: 600,
              border: "1.5px solid",
              borderColor: district === d ? "#667eea" : "#e5e7eb",
              background:
                district === d
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  : "#fff",
              color: district === d ? "#fff" : "#374151",
              cursor: "pointer",
              transition: "all 0.18s",
            }}
          >
            {d}
          </button>
        ))}
      </div>

      {/* ── MAP VIEW ── */}
      {viewMode === "map" && (
        <div style={{ marginBottom: "1.5rem" }}>
          <StationsMap
            stations={filtered}
            selectedStation={selectedStation}
            onSelectStation={(s) => {
              setSelectedStation(s);
            }}
            userLocation={userLocation}
          />
          {selectedStation && (
            <div
              className="rc-card"
              style={{ marginTop: "1rem", padding: "1rem 1.25rem" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "1rem",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {selectedStation.name}
                    <span
                      style={{
                        marginLeft: "0.5rem",
                        padding: "0.15rem 0.5rem",
                        borderRadius: "999px",
                        fontSize: "0.68rem",
                        fontWeight: 600,
                        background:
                          TYPE_COLOR[selectedStation.type] || "#667eea",
                        color: "#fff",
                      }}
                    >
                      {selectedStation.type}
                    </span>
                  </div>
                  <p className="rc-card-description" style={{ margin: 0 }}>
                    📍 {selectedStation.address} &nbsp;|&nbsp;{" "}
                    {selectedStation.district} • {selectedStation.division}
                  </p>
                  <p
                    className="rc-card-description"
                    style={{ margin: "0.25rem 0 0" }}
                  >
                    🕐 {selectedStation.hours}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStation(null)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#6b7280",
                    fontSize: "1rem",
                  }}
                >
                  <FaTimes />
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  flexWrap: "wrap",
                  marginTop: "0.75rem",
                }}
              >
                <a
                  href={`tel:${selectedStation.phone}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.45rem 0.9rem",
                    borderRadius: "999px",
                    background:
                      "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                    color: "#fff",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  <FaPhone style={{ fontSize: "0.7rem" }} />{" "}
                  {selectedStation.phone}
                </a>
                <button
                  type="button"
                  onClick={() => openDirections(selectedStation)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.45rem 0.9rem",
                    borderRadius: "999px",
                    background:
                      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                    color: "#fff",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <FaDirections style={{ fontSize: "0.8rem" }} /> Directions
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── LIST VIEW ── */}
      {viewMode === "list" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1rem",
          }}
        >
          {filtered.length === 0 ? (
            <p className="rc-hint">No stations match your search or filters.</p>
          ) : (
            filtered.map((station) => (
              <article
                key={station.id}
                className="rc-card"
                style={{
                  padding: "1.1rem 1.25rem",
                  cursor: "pointer",
                  outline:
                    selectedStation?.id === station.id
                      ? "2px solid #667eea"
                      : "none",
                  transition: "transform 0.15s",
                }}
                onClick={() => setSelectedStation(station)}
              >
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "0.5rem",
                  }}
                >
                  <div
                    className="rc-card-title"
                    style={{ margin: 0, fontSize: "0.975rem" }}
                  >
                    {station.name}
                  </div>
                  <span
                    style={{
                      padding: "0.2rem 0.6rem",
                      borderRadius: "999px",
                      fontSize: "0.68rem",
                      fontWeight: 600,
                      background: TYPE_COLOR[station.type] || "#667eea",
                      color: "#fff",
                      whiteSpace: "nowrap",
                      marginLeft: "0.5rem",
                      flexShrink: 0,
                    }}
                  >
                    {station.type}
                  </span>
                </div>

                {/* Details */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.3rem",
                    marginBottom: "0.85rem",
                  }}
                >
                  <p
                    className="rc-card-description"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      margin: 0,
                    }}
                  >
                    <FaMapMarkerAlt
                      style={{ color: "#667eea", flexShrink: 0 }}
                    />
                    {station.address}
                  </p>
                  <p
                    className="rc-card-description"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      margin: 0,
                    }}
                  >
                    <FaShieldAlt style={{ color: "#10b981", flexShrink: 0 }} />
                    {station.district} • {station.division} Division
                  </p>
                  <p
                    className="rc-card-description"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      margin: 0,
                    }}
                  >
                    <FaClock style={{ color: "#f59e0b", flexShrink: 0 }} />
                    {station.hours}
                  </p>
                  {station.distance !== undefined && (
                    <p
                      className="rc-card-description"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        margin: 0,
                        color: "#667eea",
                        fontWeight: 600,
                      }}
                    >
                      <FaMapMarkerAlt
                        style={{ color: "#667eea", flexShrink: 0 }}
                      />
                      ~{station.distance.toFixed(1)} km away
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div
                  style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}
                >
                  <a
                    href={`tel:${station.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      padding: "0.45rem 0.9rem",
                      borderRadius: "999px",
                      background:
                        "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                      color: "#fff",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    <FaPhone style={{ fontSize: "0.7rem" }} />
                    {station.phone}
                  </a>
                  <a
                    href={`tel:${station.emergency}`}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      padding: "0.45rem 0.9rem",
                      borderRadius: "999px",
                      background:
                        "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                      color: "#fff",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    <FaPhone style={{ fontSize: "0.7rem" }} />
                    999
                  </a>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDirections(station);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      padding: "0.45rem 0.9rem",
                      borderRadius: "999px",
                      background:
                        "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                      color: "#fff",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <FaDirections style={{ fontSize: "0.8rem" }} />
                    Directions
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStation(station);
                      setViewMode("map");
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      padding: "0.45rem 0.9rem",
                      borderRadius: "999px",
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "#fff",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <FaMap style={{ fontSize: "0.7rem" }} />
                    Map
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      )}

      {/* ── Footer ── */}
      <p
        className="rc-hint"
        style={{
          marginTop: "1.5rem",
          textAlign: "center",
          fontSize: "0.78rem",
        }}
      >
        Emergency numbers: <strong>999</strong> (Police) • <strong>112</strong>{" "}
        (General Emergency) • <strong>0800-199-699</strong> (UPF Toll-free).
        Always call <strong>999</strong> in a life-threatening emergency.
      </p>
    </div>
  );
}
