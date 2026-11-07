// CDES Platform - API Validation Schemas (zod)
// Defines validation rules for all API request bodies.

import { z } from "zod";

// ============================================================================
// Authentication Schemas
// ============================================================================

export const RegisterSchema = z.object({
  email: z.string().email("Invalid email format").max(255),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .max(128, "Password is too long"),
  role: z.enum(["student", "organization"] as const),
  name: z.string().max(255).optional(),
  education_level: z.string().max(100).optional(),
  organization_name: z.string().max(255).optional(),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

// ============================================================================
// Student Dossier Schemas
// ============================================================================

export const StudentDossierSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
});

export const StudentProfileSchema = z.object({
  name: z.string().max(255),
  grade: z.string().max(10),
  institution: z.string().max(255),
  province: z.string().max(100),
  primary_language: z.string().max(10),
});

// ============================================================================
// Scholarship Schemas
// ============================================================================

export const ScholarshipSearchSchema = z.object({
  query: z.string().max(500).optional(),
  domain: z.enum(["STEM", "Humanities", "Business", "Arts", "Technology", "Other"] as const).optional(),
  year: z.string().regex(/^\d{4}$/, "Year must be in YYYY format").max(4).optional(),
  pageSize: z.number().int().min(1).max(100).default(20),
  pageNumber: z.number().int().min(1).default(1),
});

export const ScholarshipCreateSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(5000),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Deadline must be in YYYY-MM-DD format"),
  amount: z.number().positive().max(10000000),
  eligibility: z.string().min(10).max(2000),
  required_docs: z.array(z.string()).max(50),
});

export const ScholarshipUpdateSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  description: z.string().min(20).max(5000).optional(),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Deadline must be in YYYY-MM-DD format").optional(),
  amount: z.number().positive().max(10000000).optional(),
  status: z.enum(["draft", "published", "archived", "withdrawn"] as const),
});

// ============================================================================
// University Schemas
// ============================================================================

export const UniversitySchema = z.object({
  name: z.string().min(3).max(255),
  country: z.string().max(100),
  location: z.string().max(255).optional(),
  website: z.string().url().optional(),
  programs: z.array(
    z.object({
      name: z.string().min(3).max(200),
      type: z.enum(["undergraduate", "graduate", "phd"] as const),
      duration: z.string().max(50),
      major: z.string().max(200).optional(),
    })
  ),
});

// ============================================================================
// Analytics Schemas
// ============================================================================

export const AnalyticsEventSchema = z.object({
  event_type: z.string().min(1).max(100),
  metadata: z.record(z.string(), z.any()).optional(),
  timestamp: z.string().datetime().optional(),
  score: z.number().min(0).max(100).optional(),
});

export const ReportSchema = z.object({
  report_type: z.enum(["performance", "attendance", "behavioral"] as const),
  period_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD"),
  period_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD"),
  student_id: z.string().min(1),
});

// ============================================================================
// Data Platform Schemas
// ============================================================================

export const DataPlatformQuerySchema = z.object({
  student_id: z.string().min(1).max(100),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

export const FeatureRequestSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  priority: z.enum(["low", "medium", "high", "critical"] as const),
  category: z.enum(["feature", "bug", "enhancement"] as const),
  tags: z.array(z.string()).max(10).optional(),
});

// ============================================================================
// Common/Utility Schemas
// ============================================================================

export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(50),
  sort: z.string().min(1).max(50).default("created_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export const SearchQuerySchema = z.object({
  q: z.string().max(500).optional(),
  filter: z.record(z.string(), z.string()).optional(),
  sort: z.string().default("relevance"),
});

export const PaginationResultSchema = z.object({
  items: z.array(z.any()),
  total: z.number().int().min(0),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  totalPages: z.number().int().min(1),
});
