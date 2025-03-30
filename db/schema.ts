import { relations } from "drizzle-orm"
import { pgTable, text, timestamp, boolean, integer, json, decimal, primaryKey } from "drizzle-orm/pg-core"

// User
export const users = pgTable("users", {
  id: text("id").primaryKey().notNull(),
  name: text("name"),
  email: text("email").unique().notNull(),
  emailVerified: timestamp("email_verified"),
  password: text("password"),
  image: text("image"),
  role: text("role").default("USER").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Account (for OAuth)
export const accounts = pgTable("accounts", {
  id: text("id").primaryKey().notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
})

// Session
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey().notNull(),
  sessionToken: text("session_token").unique().notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires").notNull(),
})

// Business Profile
export const businessProfiles = pgTable("business_profiles", {
  id: text("id").primaryKey().notNull(),
  userId: text("user_id")
    .unique()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  companyName: text("company_name").notNull(),
  industry: text("industry"),
  description: text("description"),
  website: text("website"),
  logo: text("logo"),
  banner: text("banner"),
  location: text("location"),
  size: text("size"),
  foundedYear: integer("founded_year"),
  specialties: json("specialties").$type<string[]>(),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  socialLinks: json("social_links"),
  isVerified: boolean("is_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Professional Profile
export const professionalProfiles = pgTable("professional_profiles", {
  id: text("id").primaryKey().notNull(),
  userId: text("user_id")
    .unique()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(),
  title: text("title"),
  company: text("company"),
  industry: text("industry"),
  bio: text("bio"),
  location: text("location"),
  experience: json("experience"),
  education: json("education"),
  skills: json("skills").$type<string[]>(),
  certifications: json("certifications").$type<string[]>(),
  languages: json("languages").$type<string[]>(),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  socialLinks: json("social_links"),
  isVerified: boolean("is_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Product
export const products = pgTable("products", {
  id: text("id").primaryKey().notNull(),
  businessId: text("business_id")
    .notNull()
    .references(() => businessProfiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  image: text("image"),
  price: decimal("price", { precision: 10, scale: 2 }),
  category: text("category"),
  features: json("features").$type<string[]>(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Service
export const services = pgTable("services", {
  id: text("id").primaryKey().notNull(),
  businessId: text("business_id")
    .notNull()
    .references(() => businessProfiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  image: text("image"),
  price: decimal("price", { precision: 10, scale: 2 }),
  category: text("category"),
  features: json("features").$type<string[]>(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Post
export const posts = pgTable("posts", {
  id: text("id").primaryKey().notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  media: json("media").$type<string[]>(),
  visibility: text("visibility").default("PUBLIC").notNull(),
  isPromoted: boolean("is_promoted").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  groupId: text("group_id").references(() => groups.id),
})

// Comment
export const comments = pgTable("comments", {
  id: text("id").primaryKey().notNull(),
  postId: text("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Like
export const likes = pgTable(
  "likes",
  {
    id: text("id").primaryKey().notNull(),
    postId: text("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      postUserUnique: primaryKey({ columns: [table.postId, table.userId] }),
    }
  },
)

// Connection
export const connections = pgTable("connections", {
  id: text("id").primaryKey().notNull(),
  senderId: text("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  receiverId: text("receiver_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: text("status").default("PENDING").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Message
export const messages = pgTable("messages", {
  id: text("id").primaryKey().notNull(),
  senderId: text("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  receiverId: text("receiver_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Group
export const groups = pgTable("groups", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  description: text("description"),
  image: text("image"),
  banner: text("banner"),
  isPrivate: boolean("is_private").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// GroupMember
export const groupMembers = pgTable(
  "group_members",
  {
    id: text("id").primaryKey().notNull(),
    groupId: text("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").default("MEMBER").notNull(),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      groupUserUnique: primaryKey({ columns: [table.groupId, table.userId] }),
    }
  },
)

// Event
export const events = pgTable("events", {
  id: text("id").primaryKey().notNull(),
  title: text("title").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  location: text("location"),
  isOnline: boolean("is_online").default(false).notNull(),
  meetingLink: text("meeting_link"),
  image: text("image"),
  maxAttendees: integer("max_attendees"),
  isPrivate: boolean("is_private").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// EventAttendee
export const eventAttendees = pgTable(
  "event_attendees",
  {
    id: text("id").primaryKey().notNull(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: text("status").default("REGISTERED").notNull(),
    registeredAt: timestamp("registered_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      eventUserUnique: primaryKey({ columns: [table.eventId, table.userId] }),
    }
  },
)

// Notification
export const notifications = pgTable("notifications", {
  id: text("id").primaryKey().notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  content: text("content").notNull(),
  link: text("link"),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Report
export const reports = pgTable("reports", {
  id: text("id").primaryKey().notNull(),
  reportedById: text("reported_by_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  postId: text("post_id").references(() => posts.id, { onDelete: "set null" }),
  commentId: text("comment_id").references(() => comments.id, { onDelete: "set null" }),
  reason: text("reason").notNull(),
  description: text("description"),
  status: text("status").default("PENDING").notNull(),
  moderatorId: text("moderator_id").references(() => users.id),
  moderatorNote: text("moderator_note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// SubscriptionPlan
export const subscriptionPlans = pgTable("subscription_plans", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  interval: text("interval").notNull(),
  features: json("features").$type<string[]>(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Subscription
export const subscriptions = pgTable("subscriptions", {
  id: text("id").primaryKey().notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  planId: text("plan_id")
    .notNull()
    .references(() => subscriptionPlans.id),
  status: text("status").default("ACTIVE").notNull(),
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date"),
  autoRenew: boolean("auto_renew").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// PaymentMethod
export const paymentMethods = pgTable("payment_methods", {
  id: text("id").primaryKey().notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  lastFour: text("last_four"),
  expiryMonth: integer("expiry_month"),
  expiryYear: integer("expiry_year"),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Invoice
export const invoices = pgTable("invoices", {
  id: text("id").primaryKey().notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  subscriptionId: text("subscription_id").references(() => subscriptions.id),
  paymentMethodId: text("payment_method_id").references(() => paymentMethods.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").default("PENDING").notNull(),
  dueDate: timestamp("due_date").notNull(),
  paidDate: timestamp("paid_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// ActivityLog
export const activityLogs = pgTable("activity_logs", {
  id: text("id").primaryKey().notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  details: json("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  businessProfile: one(businessProfiles),
  professionalProfile: one(professionalProfiles),
  posts: many(posts),
  comments: many(comments),
  likes: many(likes),
  sentMessages: many(messages, { relationName: "sentMessages" }),
  receivedMessages: many(messages, { relationName: "receivedMessages" }),
  sentConnections: many(connections, { relationName: "sentConnections" }),
  receivedConnections: many(connections, { relationName: "receivedConnections" }),
  groupMemberships: many(groupMembers),
  eventAttendees: many(eventAttendees),
  notifications: many(notifications),
  reportedContent: many(reports, { relationName: "reportedBy" }),
  moderatedContent: many(reports, { relationName: "moderatedBy" }),
  subscriptions: many(subscriptions),
  paymentMethods: many(paymentMethods),
  invoices: many(invoices),
  activityLogs: many(activityLogs),
}))

export const businessProfilesRelations = relations(businessProfiles, ({ one, many }) => ({
  user: one(users, { fields: [businessProfiles.userId], references: [users.id] }),
  products: many(products),
  services: many(services),
}))

export const professionalProfilesRelations = relations(professionalProfiles, ({ one }) => ({
  user: one(users, { fields: [professionalProfiles.userId], references: [users.id] }),
}))

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, { fields: [posts.userId], references: [users.id] }),
  comments: many(comments),
  likes: many(likes),
  reports: many(reports),
  group: one(groups, { fields: [posts.groupId], references: [groups.id] }),
}))

export const commentsRelations = relations(comments, ({ one, many }) => ({
  post: one(posts, { fields: [comments.postId], references: [posts.id] }),
  user: one(users, { fields: [comments.userId], references: [users.id] }),
  likes: many(likes),
  reports: many(reports),
}))

export const likesRelations = relations(likes, ({ one }) => ({
  post: one(posts, { fields: [likes.postId], references: [posts.id] }),
  user: one(users, { fields: [likes.userId], references: [users.id] }),
}))

export const connectionsRelations = relations(connections, ({ one }) => ({
  sender: one(users, { fields: [connections.senderId], references: [users.id] }),
  receiver: one(users, { fields: [connections.receiverId], references: [users.id] }),
}))

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, { fields: [messages.senderId], references: [users.id] }),
  receiver: one(users, { fields: [messages.receiverId], references: [users.id] }),
}))

export const groupsRelations = relations(groups, ({ many }) => ({
  posts: many(posts),
  groupMemberships: many(groupMembers),
}))

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, { fields: [groupMembers.groupId], references: [groups.id] }),
  user: one(users, { fields: [groupMembers.userId], references: [users.id] }),
}))

export const eventsRelations = relations(events, ({ many }) => ({
  eventAttendees: many(eventAttendees),
}))

export const eventAttendeesRelations = relations(eventAttendees, ({ one }) => ({
  event: one(events, { fields: [eventAttendees.eventId], references: [events.id] }),
  user: one(users, { fields: [eventAttendees.userId], references: [users.id] }),
}))

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}))

export const reportsRelations = relations(reports, ({ one }) => ({
  reportedBy: one(users, { fields: [reports.reportedById], references: [users.id] }),
  post: one(posts, { fields: [reports.postId], references: [posts.id] }),
  comment: one(comments, { fields: [reports.commentId], references: [comments.id] }),
  moderator: one(users, { fields: [reports.moderatorId], references: [users.id] }),
}))

export const subscriptionPlansRelations = relations(subscriptionPlans, ({ many }) => ({
  subscriptions: many(subscriptions),
}))

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, { fields: [subscriptions.userId], references: [users.id] }),
  plan: one(subscriptionPlans, { fields: [subscriptions.planId], references: [subscriptionPlans.id] }),
}))

export const paymentMethodsRelations = relations(paymentMethods, ({ one }) => ({
  user: one(users, { fields: [paymentMethods.userId], references: [users.id] }),
}))

export const invoicesRelations = relations(invoices, ({ one }) => ({
  user: one(users, { fields: [invoices.userId], references: [users.id] }),
  subscription: one(subscriptions, { fields: [invoices.subscriptionId], references: [subscriptions.id] }),
  paymentMethod: one(paymentMethods, { fields: [invoices.paymentMethodId], references: [paymentMethods.id] }),
}))

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, { fields: [activityLogs.userId], references: [users.id] }),
}))

