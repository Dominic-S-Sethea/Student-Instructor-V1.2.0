// CDES Platform - Validation Middleware
// Uses zod for request body validation on API endpoints.

import { ZodSchema, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";

export type ValidationSchema<T> = ZodSchema<T>;

/**
 * Middleware factory that validates request body against a zod schema.
 * @param schema - The zod schema to validate against
 * @param property - The request property to validate (default: "body")
 */
export function validate<T>(
  schema: ZodSchema<T>,
  property: "body" | "query" | "params" = "body"
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = req[property];
      if (
        property === "body" &&
        (data === null || typeof data !== "object" || Array.isArray(data))
      ) {
        res.status(400).json({
          success: false,
          error: "Request body must be a JSON object.",
        });
        return;
      }
      const validated = schema.parse(data);
      req[property] = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
            type: e.code,
          })),
        });
        return;
      }
      res.status(500).json({
        success: false,
        error: "Internal validation error",
      });
    }
  };
}

/**
 * Convenience wrapper for validating a single field.
 */
export function validateField<T>(
  schema: ZodSchema<T>,
  fieldName: string
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const value = req.body?.[fieldName];
      const validated = schema.parse(value);
      req.body = { ...req.body, [fieldName]: validated };
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.issues.map((e) => ({
            field: fieldName,
            message: e.message,
            type: e.code,
          })),
        });
        return;
      }
      res.status(500).json({
        success: false,
        error: "Internal validation error",
      });
    }
  };
}
