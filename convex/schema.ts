import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    externalUserId: v.optional(v.string()),
    role: v.union(v.literal("reporter"), v.literal("responder"), v.literal("admin")),
    displayName: v.string(),
    phone: v.optional(v.string()),
    phoneVerifiedAt: v.optional(v.number()),
    approved: v.boolean(),
    responderCategoryIds: v.optional(v.array(v.id("responderCategories"))),
    lastLatitude: v.optional(v.number()),
    lastLongitude: v.optional(v.number()),
    lastLocationAt: v.optional(v.number()),
    pushToken: v.optional(v.string()),
    telegramChatId: v.optional(v.string()),
  })
    .index("by_external_user", ["externalUserId"])
    .index("by_role", ["role"])
    .index("by_phone", ["phone"]),

  responderCategories: defineTable({
    name: v.string(),
    slug: v.string(),
    priority: v.number(),
    active: v.boolean(),
  }).index("by_slug", ["slug"]),

  phoneVerifications: defineTable({
    phone: v.string(),
    guestSessionId: v.optional(v.string()),
    purpose: v.literal("incident_report"),
    codeHash: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("verified"),
      v.literal("expired"),
      v.literal("blocked")
    ),
    attemptCount: v.number(),
    createdAt: v.number(),
    expiresAt: v.number(),
    verifiedAt: v.optional(v.number()),
  })
    .index("by_phone", ["phone"])
    .index("by_phone_status", ["phone", "status"]),

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

    reporterUserId: v.optional(v.id("users")),
    guestSessionId: v.optional(v.string()),
    reporterName: v.string(),
    reporterPhone: v.string(),
    reporterPhoneVerified: v.boolean(),
    reporterPhoneVerifiedAt: v.optional(v.number()),
    reporterVerification: v.union(
      v.literal("bansko_account"),
      v.literal("sms"),
      v.literal("unverified")
    ),

    latitude: v.number(),
    longitude: v.number(),
    accuracyMeters: v.optional(v.number()),
    locationLabel: v.optional(v.string()),
    mediaStorageIds: v.array(v.id("_storage")),

    trustScore: v.number(),
    fraudFlags: v.array(v.string()),
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
    channel: v.union(v.literal("push"), v.literal("telegram"), v.literal("internal")),
    status: v.union(
      v.literal("queued"),
      v.literal("sent"),
      v.literal("accepted"),
      v.literal("declined"),
      v.literal("expired"),
      v.literal("forwarded")
    ),
    sentAt: v.optional(v.number()),
    respondedAt: v.optional(v.number()),
  })
    .index("by_incident", ["incidentId"])
    .index("by_responder", ["responderId"]),

  incidentEvents: defineTable({
    incidentId: v.id("incidents"),
    actorUserId: v.optional(v.id("users")),
    type: v.string(),
    message: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_incident", ["incidentId"]),
});
