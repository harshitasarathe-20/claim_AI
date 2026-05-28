interface Props {
  damageLocation: string;
}

// Extract just the damage area from the full analysis string if needed
const extractDamageArea = (fullText: string): string => {
  // If it looks like it contains multiple fields separated by spaces and field names like "field=value"
  if (fullText.includes("=")) {
    // The damage location is typically at the start, before any field declarations
    // Find everything before the first "field=" pattern
    const parts = fullText.split(/\s+(?:impact_direction|severity|collision_type|fraud_risk|confidence_score|observations|recommended_action)=/);
    if (parts.length > 0) {
      return parts[0].trim();
    }
  }
  
  // If it's just plain text, return as is
  return fullText.trim();
};

const DAMAGE_LOCATION_MAP: Record<string, { region: string; description: string; color: string }> = {
  "Front bumper": { region: "front", description: "Front Bumper", color: "#EF4444" },
  "Front left": { region: "frontLeft", description: "Front Left", color: "#EF4444" },
  "Front right": { region: "frontRight", description: "Front Right", color: "#EF4444" },
  "Left side": { region: "sideLeft", description: "Left Side", color: "#F97316" },
  "Right side": { region: "sideRight", description: "Right Side", color: "#F97316" },
  "Rear bumper": { region: "rear", description: "Rear Bumper", color: "#EF4444" },
  "Rear left": { region: "rearLeft", description: "Rear Left", color: "#EF4444" },
  "Rear right": { region: "rearRight", description: "Rear Right", color: "#EF4444" },
  "Roof": { region: "roof", description: "Roof", color: "#D97706" },
  "Hood": { region: "hood", description: "Hood", color: "#D97706" },
  "Trunk": { region: "trunk", description: "Trunk", color: "#D97706" },
  "Windshield": { region: "windshield", description: "Windshield", color: "#7C3AED" },
  "Side window": { region: "window", description: "Side Window", color: "#7C3AED" },
  "Door": { region: "door", description: "Door", color: "#F97316" },
  "Wheel": { region: "wheel", description: "Wheel", color: "#6B7280" },
  "Front": { region: "front", description: "Front", color: "#EF4444" },
  "Rear": { region: "rear", description: "Rear", color: "#EF4444" },
  "Left": { region: "sideLeft", description: "Left", color: "#F97316" },
  "Right": { region: "sideRight", description: "Right", color: "#F97316" },
};

export default function DamageLocationVisual({ damageLocation }: Props) {
  // Extract just the damage area if full analysis text is passed
  const cleanLocation = extractDamageArea(damageLocation);
  
  // Try to find the best match in the map
  let locationInfo = DAMAGE_LOCATION_MAP[cleanLocation];
  
  // If no exact match, try extracting the first word and matching that
  if (!locationInfo && cleanLocation.includes(" ")) {
    const firstWord = cleanLocation.split(/[\s\(\)]/)[0]; // Get first word before space or parenthesis
    if (firstWord) {
      locationInfo = DAMAGE_LOCATION_MAP[firstWord];
    }
  }
  
  // If still no match, try case-insensitive or partial matching
  if (!locationInfo) {
    const lowerClean = cleanLocation.toLowerCase();
    for (const [key, value] of Object.entries(DAMAGE_LOCATION_MAP)) {
      if (lowerClean.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerClean)) {
        locationInfo = value;
        break;
      }
    }
  }

  // Default if no match found - but still show the text description
  if (!locationInfo) {
    locationInfo = { region: "unknown", description: cleanLocation || "Unknown", color: "#94A3B8" };
  }

  return (
    <div className="damage-location-container">
      {/* Only show visual diagram if we have a valid match */}
      {locationInfo.region !== "unknown" && (
        <div className="damage-location-visual">
          <svg
            viewBox="0 0 240 140"
            className="damage-car-diagram"
            xmlns="http://www.w3.org/2000/svg"
          >
          {/* Car Body */}
          <g className="car-body">
            {/* Main chassis */}
            <path
              d="M 30 70 Q 30 100 50 110 L 190 110 Q 210 100 210 70 L 210 50 Q 210 30 190 30 L 50 30 Q 30 30 30 50 Z"
              fill="rgba(255, 255, 255, 0.05)"
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="1.5"
            />

            {/* Front bumper */}
            <rect
              x="15"
              y="65"
              width="15"
              height="20"
              className={`car-part ${locationInfo.region === "front" ? "damaged" : "normal"}`}
              fill={locationInfo.region === "front" ? locationInfo.color : "rgba(255, 255, 255, 0.1)"}
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="1"
            />

            {/* Hood */}
            <path
              d="M 50 30 L 190 30 Q 200 30 200 45 L 50 45 Z"
              className={`car-part ${locationInfo.region === "hood" ? "damaged" : "normal"}`}
              fill={locationInfo.region === "hood" ? locationInfo.color : "rgba(255, 255, 255, 0.08)"}
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="1"
            />

            {/* Windshield */}
            <path
              d="M 60 45 L 180 45 L 180 60 L 60 58 Z"
              className={`car-part ${locationInfo.region === "windshield" ? "damaged" : "normal"}`}
              fill={locationInfo.region === "windshield" ? `${locationInfo.color}33` : "rgba(135, 206, 235, 0.15)"}
              stroke="rgba(135, 206, 235, 0.4)"
              strokeWidth="1"
            />

            {/* Roof */}
            <path
              d="M 70 60 L 170 60 L 170 75 L 70 75 Z"
              className={`car-part ${locationInfo.region === "roof" ? "damaged" : "normal"}`}
              fill={locationInfo.region === "roof" ? locationInfo.color : "rgba(255, 255, 255, 0.15)"}
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="1"
            />

            {/* Front Left Door */}
            <rect
              x="70"
              y="75"
              width="35"
              height="35"
              className={`car-part ${locationInfo.region === "door" || locationInfo.region === "sideLeft" ? "damaged" : "normal"}`}
              fill={locationInfo.region === "door" || locationInfo.region === "sideLeft" ? locationInfo.color : "rgba(255, 255, 255, 0.12)"}
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="1"
            />

            {/* Front Right Door */}
            <rect
              x="135"
              y="75"
              width="35"
              height="35"
              className={`car-part ${locationInfo.region === "door" || locationInfo.region === "sideRight" ? "damaged" : "normal"}`}
              fill={locationInfo.region === "door" || locationInfo.region === "sideRight" ? locationInfo.color : "rgba(255, 255, 255, 0.12)"}
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="1"
            />

            {/* Window - Left */}
            <rect
              x="75"
              y="78"
              width="25"
              height="20"
              className={`car-part ${locationInfo.region === "window" ? "damaged" : "normal"}`}
              fill={locationInfo.region === "window" ? `${locationInfo.color}33` : "rgba(135, 206, 235, 0.15)"}
              stroke="rgba(135, 206, 235, 0.4)"
              strokeWidth="0.5"
            />

            {/* Window - Right */}
            <rect
              x="140"
              y="78"
              width="25"
              height="20"
              className={`car-part ${locationInfo.region === "window" ? "damaged" : "normal"}`}
              fill={locationInfo.region === "window" ? `${locationInfo.color}33` : "rgba(135, 206, 235, 0.15)"}
              stroke="rgba(135, 206, 235, 0.4)"
              strokeWidth="0.5"
            />

            {/* Trunk */}
            <path
              d="M 170 75 Q 180 75 190 85 L 190 110 L 170 110 Z"
              className={`car-part ${locationInfo.region === "trunk" ? "damaged" : "normal"}`}
              fill={locationInfo.region === "trunk" ? locationInfo.color : "rgba(255, 255, 255, 0.12)"}
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="1"
            />

            {/* Rear bumper */}
            <rect
              x="210"
              y="65"
              width="15"
              height="20"
              className={`car-part ${locationInfo.region === "rear" ? "damaged" : "normal"}`}
              fill={locationInfo.region === "rear" ? locationInfo.color : "rgba(255, 255, 255, 0.1)"}
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="1"
            />

            {/* Left Side Line */}
            <line
              x1="30"
              y1="75"
              x2="30"
              y2="100"
              className={`car-part ${locationInfo.region === "frontLeft" || locationInfo.region === "sideLeft" ? "damaged" : "normal"}`}
              stroke={locationInfo.region === "frontLeft" || locationInfo.region === "sideLeft" ? locationInfo.color : "rgba(255, 255, 255, 0.2)"}
              strokeWidth={locationInfo.region === "frontLeft" || locationInfo.region === "sideLeft" ? "2.5" : "1.5"}
            />

            {/* Right Side Line */}
            <line
              x1="210"
              y1="75"
              x2="210"
              y2="100"
              className={`car-part ${locationInfo.region === "frontRight" || locationInfo.region === "sideRight" ? "damaged" : "normal"}`}
              stroke={locationInfo.region === "frontRight" || locationInfo.region === "sideRight" ? locationInfo.color : "rgba(255, 255, 255, 0.2)"}
              strokeWidth={locationInfo.region === "frontRight" || locationInfo.region === "sideRight" ? "2.5" : "1.5"}
            />
          </g>

          {/* Front Left Wheel */}
          <g className={`car-part ${locationInfo.region === "wheel" && damageLocation.includes("left") ? "damaged" : "normal"}`}>
            <circle
              cx="60"
              cy="115"
              r="8"
              fill={locationInfo.region === "wheel" && damageLocation.includes("left") ? locationInfo.color : "rgba(255, 255, 255, 0.15)"}
              stroke="rgba(255, 255, 255, 0.4)"
              strokeWidth="1"
            />
            <circle cx="60" cy="115" r="5" fill="rgba(20, 20, 20, 0.8)" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="0.5" />
          </g>

          {/* Front Right Wheel */}
          <g className={`car-part ${locationInfo.region === "wheel" && damageLocation.includes("right") ? "damaged" : "normal"}`}>
            <circle
              cx="180"
              cy="115"
              r="8"
              fill={locationInfo.region === "wheel" && damageLocation.includes("right") ? locationInfo.color : "rgba(255, 255, 255, 0.15)"}
              stroke="rgba(255, 255, 255, 0.4)"
              strokeWidth="1"
            />
            <circle cx="180" cy="115" r="5" fill="rgba(20, 20, 20, 0.8)" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="0.5" />
          </g>
        </svg>
        </div>
      )}

      <div className="damage-location-info">
        <div className="damage-location-label">Damaged Area</div>
        <div className="damage-location-badge">
          <div
            className="damage-badge-indicator"
            style={{ backgroundColor: locationInfo.color }}
          />
          <span>{locationInfo.description}</span>
        </div>
      </div>
    </div>
  );
}
