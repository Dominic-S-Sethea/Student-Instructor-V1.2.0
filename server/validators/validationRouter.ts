// CDES Platform - Validation Router Middleware
// Binds Zod validation schemas to Express routes.

import { Router } from "express";
import {
  validate,
  validateField,
  type ValidationSchema,
} from "../middleware/validationMiddleware";
import { z } from "zod";
import {
  RegisterSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  StudentDossierSchema,
  ScholarshipSearchSchema,
  ScholarshipCreateSchema,
  ScholarshipUpdateSchema,
  UniversitySchema,
  AnalyticsEventSchema,
  ReportSchema,
  DataPlatformQuerySchema,
  FeatureRequestSchema,
  PaginationSchema,
  SearchQuerySchema,
} from "../validators/apiSchemas";

const router = Router();

// Authentication routes validation
router.post(
  "/auth/register",
  validate(RegisterSchema, "body")
);
router.post(
  "/auth/login",
  validate(LoginSchema, "body")
);
router.post(
  "/auth/forgot-password",
  validate(ForgotPasswordSchema, "body")
);
router.post(
  "/auth/reset-password",
  validate(ResetPasswordSchema, "body")
);

// Student dossier routes
router.post(
  "/student-dossier",
  validate(StudentDossierSchema, "body")
);

// Scholarship routes
router.post(
  "/scholarships/search",
  validate(ScholarshipSearchSchema, "query")
);
router.post(
  "/scholarships/create",
  validate(ScholarshipCreateSchema, "body")
);
router.post(
  "/scholarships/update",
  validate(ScholarshipUpdateSchema, "body")
);

// University routes
router.post(
  "/university",
  validate(UniversitySchema, "body")
);

// Analytics routes
router.post(
  "/analytics/event",
  validate(AnalyticsEventSchema, "body")
);
router.post(
  "/analytics/report",
  validate(ReportSchema, "body")
);

// Data platform routes
router.post(
  "/data-platform/query",
  validate(DataPlatformQuerySchema, "body")
);
router.post(
  "/data-platform/feature-request",
  validate(FeatureRequestSchema, "body")
);

// Generic pagination route
router.post(
  "/data-platform/paginate",
  validate(PaginationSchema, "body")
);
router.post(
  "/data-platform/search",
  validate(SearchQuerySchema, "body")
);

export default router;
