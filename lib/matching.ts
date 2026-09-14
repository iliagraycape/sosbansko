export type Availability = "available" | "limited" | "offline";

export type Responder = {
  id: string;
  name: string;
  role: string;
  latitude: number;
  longitude: number;
  availability: Availability;
  verified: boolean;
  skills: string[];
  equipment: string[];
  lastSeenAt: number;
};

export type IncidentProfile = {
  id: string;
  requiredSkills: string[];
  usefulEquipment: string[];
  severity: "critical" | "urgent" | "assistance";
};

export type ResponderMatch = Responder & {
  distanceKm: number;
  score: number;
  skillMatches: string[];
  equipmentMatches: string[];
};

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const radius = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function rankResponders(
  responders: Responder[],
  incident: IncidentProfile,
  latitude: number,
  longitude: number,
  now = Date.now()
): ResponderMatch[] {
  return responders
    .map((responder) => {
      const distance = distanceKm(latitude, longitude, responder.latitude, responder.longitude);
      const skillMatches = responder.skills.filter((skill) => incident.requiredSkills.includes(skill));
      const equipmentMatches = responder.equipment.filter((item) => incident.usefulEquipment.includes(item));
      const freshnessMinutes = Math.max(0, (now - responder.lastSeenAt) / 60000);

      let score = 0;
      score += responder.availability === "available" ? 100 : responder.availability === "limited" ? 35 : -1000;
      score += responder.verified ? 30 : -25;
      score += skillMatches.length * 42;
      score += equipmentMatches.length * 18;
      score += incident.severity === "critical" && skillMatches.length > 0 ? 20 : 0;
      score -= Math.min(distance * 7, 120);
      score -= Math.min(freshnessMinutes * 1.5, 80);

      return {
        ...responder,
        distanceKm: distance,
        score: Math.round(score),
        skillMatches,
        equipmentMatches,
      };
    })
    .filter((responder) => responder.availability !== "offline")
    .sort((a, b) => b.score - a.score || a.distanceKm - b.distanceKm);
}
