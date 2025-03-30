export interface User {
  id: string
  name?: string | null
  email: string
  emailVerified?: Date | null
  password?: string | null
  image?: string | null
  role: string
  createdAt: Date
  updatedAt: Date
}

export interface BusinessProfile {
  id: string
  userId: string
  companyName: string
  industry?: string | null
  description?: string | null
  website?: string | null
  logo?: string | null
  banner?: string | null
  location?: string | null
  size?: string | null
  foundedYear?: number | null
  specialties?: string[]
  contactEmail?: string | null
  contactPhone?: string | null
  socialLinks?: Record<string, string>
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ProfessionalProfile {
  id: string
  userId: string
  fullName: string
  title?: string | null
  company?: string | null
  industry?: string | null
  bio?: string | null
  location?: string | null
  experience?: Record<string, any>[]
  education?: Record<string, any>[]
  skills?: string[]
  certifications?: string[]
  languages?: string[]
  contactEmail?: string | null
  contactPhone?: string | null
  socialLinks?: Record<string, string>
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Post {
  id: string
  userId: string
  content: string
  media?: string[]
  visibility: string
  isPromoted: boolean
  createdAt: Date
  updatedAt: Date
  groupId?: string | null
}

export interface Comment {
  id: string
  postId: string
  userId: string
  content: string
  createdAt: Date
  updatedAt: Date
}

export interface Like {
  id: string
  postId: string
  userId: string
  createdAt: Date
}

export interface Connection {
  id: string
  senderId: string
  receiverId: string
  status: string
  createdAt: Date
  updatedAt: Date
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  isRead: boolean
  createdAt: Date
}

export interface Group {
  id: string
  name: string
  description?: string | null
  image?: string | null
  banner?: string | null
  isPrivate: boolean
  createdAt: Date
  updatedAt: Date
}

export interface GroupMember {
  id: string
  groupId: string
  userId: string
  role: string
  joinedAt: Date
}

export interface Event {
  id: string
  title: string
  description?: string | null
  startDate: Date
  endDate?: Date | null
  location?: string | null
  isOnline: boolean
  meetingLink?: string | null
  image?: string | null
  maxAttendees?: number | null
  isPrivate: boolean
  createdAt: Date
  updatedAt: Date
}

export interface EventAttendee {
  id: string
  eventId: string
  userId: string
  status: string
  registeredAt: Date
}

export interface Notification {
  id: string
  userId: string
  type: string
  content: string
  link?: string | null
  isRead: boolean
  createdAt: Date
}

export interface Report {
  id: string
  reportedById: string
  postId?: string | null
  commentId?: string | null
  reason: string
  description?: string | null
  status: string
  moderatorId?: string | null
  moderatorNote?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface SubscriptionPlan {
  id: string
  name: string
  description?: string | null
  price: number
  interval: string
  features?: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Subscription {
  id: string
  userId: string
  planId: string
  status: string
  startDate: Date
  endDate?: Date | null
  autoRenew: boolean
  createdAt: Date
  updatedAt: Date
}

export interface PaymentMethod {
  id: string
  userId: string
  type: string
  provider: string
  lastFour?: string | null
  expiryMonth?: number | null
  expiryYear?: number | null
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Invoice {
  id: string
  userId: string
  subscriptionId?: string | null
  paymentMethodId?: string | null
  amount: number
  status: string
  dueDate: Date
  paidDate?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface ActivityLog {
  id: string
  userId: string
  action: string
  details?: Record<string, any>
  ipAddress?: string | null
  userAgent?: string | null
  createdAt: Date
}

