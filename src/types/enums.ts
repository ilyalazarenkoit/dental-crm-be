export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  DOCTOR = 'doctor',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  EXPIRED = 'expired',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING_VERIFICATION = 'pending_verification',
}

export enum PatientStatus {
  NEW = 'new',
  ACTIVE = 'active',
  VIP = 'vip',
  ARCHIVED = 'archived',
}

export enum VisitType {
  CONSULTATION = 'consultation',
  TREATMENT = 'treatment',
  CONTROL = 'control',
}

export enum VisitStatus {
  PLANNED = 'planned',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
}

export enum DoctorRole {
  PRIMARY = 'primary',
  ASSISTANT = 'assistant',
}

export enum BillingStatus {
  PAID = 'paid',
  UNPAID = 'unpaid',
  PENDING = 'pending',
  REFUNDED = 'refunded',
}
