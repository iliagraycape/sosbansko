import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const availability = v.union(
  v.literal("available"),
  v.literal("limited"),
  v.literal("offline")
);

const operationalPriority = v.union(
  v.literal("critical"),
  v.literal("high"),
  v.literal("normal")
);

const rescueRole = v.union(
  v.literal("chief"),
  v.literal("lead"),
  v.literal("responder")
);

const rescueAccessStatus = v.union(
  v.literal("active"),
  v.literal("suspended")
);

export default defineSchema({
  reporterAccounts: defineTable({
    banskoUserId: v.string(),
    displayName: v.string(),
    phone: v.optional(v.string()),
    active: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_bansko_user", ["banskoUserId"])
    .index("by_phone", ["phone"]),

  rescueAccounts: defineTable({
    role: rescueRole,
    displayName: v.string(),
    phone: v.optional(v.string()),
    accessStatus: rescueAccessStatus,
    createdByRescueAccountId: v.optional(v.id("rescueAccounts")),
    suspendedByRescueAccountId: v.optional(v.id("rescueAccounts")),
    suspendedAt: v.optional(v.number()),
    suspensionReason: v.optional(v.string()),
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
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_role", ["role"])
    .index("by_access_status", ["accessStatus"])
    .index("by_availability", ["responderAvailability"])
    .index("by_phone", ["phone"]),

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
    operationalPriority,
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

    reporterType: v.union(v.literal("registered"), v.literal("guest")),
    reporterAccountId: v.optional(v.id("reporterAccounts")),
    guestSessionId: v.optional(v.string()),
    reporterName: v.string(),
    reporterPhone: v.string(),
    reporterIdentitySource: v.union(
      v.literal("bansko_account"),
      v.literal("guest_contact")
    ),
    reporterCanReceiveCallback: v.boolean(),
    dataUseAcknowledged: v.boolean(),
    servicesNotified: v.boolean(),
    servicesNotifiedAt: v.optional(v.number()),

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
    coordinatorRescueAccountId: v.optional(v.id("rescueAccounts")),
    createdAt: v.number(),
    resolvedAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"])
    .index("by_reporter_phone", ["reporterPhone"])
    .index("by_reporter_account", ["reporterAccountId"])
    .index("by_status_priority", ["status", "operationalPriority"]),

  dispatches: defineTable({
    incidentId: v.id("incidents"),
    responderId: v.id("rescueAccounts"),
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
    rescueAccountId: v.id("rescueAccounts"),
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
    .index("by_rescue_account", ["rescueAccountId"]),

  incidentUpdates: defineTable({
    incidentId: v.id("incidents"),
    actorRescueAccountId: v.optional(v.id("rescueAccounts")),
    type: v.union(
      v.literal("system"),
      v.literal("status"),
      v.literal("resource_request"),
      v.literal("safety")
    ),
    message: v.string(),
    createdAt: v.number(),
  }).index("by_incident", ["incidentId"]),

  incidentLocationTrail: defineTable({
    incidentId: v.id("incidents"),
    reporterAccountId: v.optional(v.id("reporterAccounts")),
    rescueAccountId: v.optional(v.id("rescueAccounts")),
    source: v.union(v.literal("reporter"), v.literal("responder"), v.literal("system")),
    latitude: v.number(),
    longitude: v.number(),
    altitudeMeters: v.optional(v.number()),
    accuracyMeters: v.optional(v.number()),
    recordedAt: v.number(),
  })
    .index("by_incident", ["incidentId"])
    .index("by_reporter_account", ["reporterAccountId"])
    .index("by_rescue_account", ["rescueAccountId"]),

  rescueAccessEvents: defineTable({
    rescueAccountId: v.id("rescueAccounts"),
    actorRescueAccountId: v.id("rescueAccounts"),
    action: v.union(v.literal("created"), v.literal("activated"), v.literal("suspended")),
    reason: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_rescue_account", ["rescueAccountId"])
    .index("by_actor", ["actorRescueAccountId"]),

  incidentEvents: defineTable({
    incidentId: v.id("incidents"),
    actorReporterAccountId: v.optional(v.id("reporterAccounts")),
    actorRescueAccountId: v.optional(v.id("rescueAccounts")),
    type: v.string(),
    message: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_incident", ["incidentId"]),
});
