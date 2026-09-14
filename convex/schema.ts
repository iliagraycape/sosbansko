import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const availability = v.union(
  v.literal("available"),
  v.literal("limited"),
  v.literal("offline")
);

export default defineSchema({
  users: defineTable({
    externalUserId: v.optional(v.string()),
    role: v.union(v.literal("reporter"), v.literal("responder"), v.literal("admin")),
    displayName: v.string(),
    phone: v.optional(v.string()),
    identityVerified: v.boolean(),
    identitySource: v.optional(v.union(v.literal("bansko_account"), v.literal("admin"))),
    approved: v.boolean(),
    responderCategoryIds: v.optional(v.array(v.id("responderCategories"))),
    responderAvailability: v.optional(availability),
    responderSkills: v.optional(v.array(v.string())),
    responderEquipment: v.optional(v.array(v.string())),
    responderNotes: v.optional(v.string()),
    lastLatitude: v.optional(v.number()),
    lastLongitude: v.optional(v.number()),
    lastAltitudeMeters: v.optional(v.number()),
    lastLocationAccuracyMeters: v.optional(v.number()),
    lastLocationAt: v.optional(v.number()),
    pushToken: v.optional(v.string()),
    telegramChatId: v.optional(v.string()),
  })
    .index("by_external_user", ["externalUserId"])
    .index("by_role", ["role"])
    .index("by_phone", ["phone"])
    .index("by_availability", ["responderAvailability"]),

  responderCategories: defineTable({
    name: v.string(),
    slug: v.string(),
    priority: v.number(),
    active: v.boolean(),
    skills: v.optional(v.array(v.string())),
  }).index("by_slug", ["slug"]),

  incidents: defineTable({
    type: v.string(),
    title: v.string(),
    details: v.optional(v.string()),
    severity: v.union(v.literal("critical"), v.literal("urgent"), v.literal("assistance")),
    status: v.union(
      v.literal("new"),
      v.literal("dispatching"),
      v.literal("responding"),
      v.literal("resolved"),
      v.literal("rejected")
    ),
    reportMode: v.optional(v.union(v.literal("witness"), v.literal("self_danger"))),
    requiredSkills: v.optional(v.array(v.string())),
    usefulEquipment: v.optional(v.array(v.string())),
    safetyInstruction: v.optional(v.string()),

    reporterUserId: v.optional(v.id("users")),
    guestSessionId: v.optional(v.string()),
    reporterName: v.string(),
    reporterPhone: v.string(),
    reporterIdentityVerified: v.boolean(),
    reporterIdentitySource: v.union(
      v.literal("bansko_account"),
      v.literal("admin"),
      v.literal("guest_contact")
    ),
    reporterCanReceiveCallback: v.boolean(),

    latitude: v.number(),
    longitude: v.number(),
    altitudeMeters: v.optional(v.number()),
    accuracyMeters: v.optional(v.number()),
    locationLabel: v.optional(v.string()),
    mediaStorageIds: v.array(v.id("_storage")),

    trustScore: v.number(),
    fraudFlags: v.array(v.string()),
    corroborationCount: v.number(),
    callbackConfirmedAt: v.optional(v.number()),
    coordinatorUserId: v.optional(v.id("users")),
    createdAt: v.number(),
    resolvedAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"])
    .index("by_reporter_phone", ["reporterPhone"]),

  dispatches: defineTable({
    incidentId: v.id("incidents"),
    responderId: v.id("users"),
    distanceMeters: v.number(),
    estimatedArrivalMinutes: v.optional(v.number()),
    priorityRank: v.number(),
    matchScore: v.optional(v.number()),
    matchedSkills: v.optional(v.array(v.string())),
    matchedEquipment: v.optional(v.array(v.string())),
    channel: v.union(v.literal("push"), v.literal("telegram"), v.literal("internal")),
    status: v.union(
      v.literal("queued"),
      v.literal("sent"),
      v.literal("accepted"),
      v.literal("declined"),
      v.literal("expired"),
      v.literal("forwarded"),
      v.literal("en_route"),
      v.literal("arrived")
    ),
    sentAt: v.optional(v.number()),
    respondedAt: v.optional(v.number()),
    acceptedAt: v.optional(v.number()),
    arrivedAt: v.optional(v.number()),
  })
    .index("by_incident", ["incidentId"])
    .index("by_responder", ["responderId"])
    .index("by_incident_status", ["incidentId", "status"]),

  incidentParticipants: defineTable({
    incidentId: v.id("incidents"),
    userId: v.id("users"),
    role: v.union(v.literal("coordinator"), v.literal("responder"), v.literal("observer")),
    status: v.union(
      v.literal("invited"),
      v.literal("accepted"),
      v.literal("en_route"),
      v.literal("arrived"),
      v.literal("left")
    ),
    joinedAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_incident", ["incidentId"])
    .index("by_user", ["userId"]),

  incidentUpdates: defineTable({
    incidentId: v.id("incidents"),
    actorUserId: v.optional(v.id("users")),
    type: v.union(
      v.literal("system"),
      v.literal("status"),
      v.literal("message"),
      v.literal("resource_request"),
      v.literal("safety")
    ),
    message: v.string(),
    createdAt: v.number(),
  }).index("by_incident", ["incidentId"]),

  incidentLocationTrail: defineTable({
    incidentId: v.id("incidents"),
    userId: v.optional(v.id("users")),
    source: v.union(v.literal("reporter"), v.literal("responder"), v.literal("system")),
    latitude: v.number(),
    longitude: v.number(),
    altitudeMeters: v.optional(v.number()),
    accuracyMeters: v.optional(v.number()),
    recordedAt: v.number(),
  })
    .index("by_incident", ["incidentId"])
    .index("by_user", ["userId"]),

  incidentEvents: defineTable({
    incidentId: v.id("incidents"),
    actorUserId: v.optional(v.id("users")),
    type: v.string(),
    message: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_incident", ["incidentId"]),
});
