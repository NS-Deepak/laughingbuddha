import { NextResponse } from 'next/server';

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: unknown;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(message: string, code: string = 'INTERNAL_ERROR', statusCode: number = 500, details?: unknown) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'AppError';
  }
}

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);

  // Handle known AppError
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        ...(process.env.NODE_ENV === 'development' && { details: error.details }),
      },
      { status: error.statusCode }
    );
  }

  // Handle Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; message: string };
    
    switch (prismaError.code) {
      case 'P2002':
        return NextResponse.json(
          { error: 'A record with this value already exists', code: 'DUPLICATE_ENTRY' },
          { status: 409 }
        );
      case 'P2025':
        return NextResponse.json(
          { error: 'Record not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      case 'P2003':
        return NextResponse.json(
          { error: 'Foreign key constraint failed', code: 'FOREIGN_KEY_ERROR' },
          { status: 400 }
        );
      default:
        return NextResponse.json(
          { error: 'Database error occurred', code: 'DATABASE_ERROR' },
          { status: 500 }
        );
    }
  }

  // Handle standard errors
  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }

  // Handle unknown errors
  return NextResponse.json(
    { error: 'An unexpected error occurred', code: 'UNKNOWN_ERROR' },
    { status: 500 }
  );
}

export function createSuccessResponse<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function createErrorResponse(message: string, status: number = 400, code?: string): NextResponse {
  return NextResponse.json(
    { error: message, code: code || 'ERROR' },
    { status }
  );
}

// Validation helpers
export function validateRequired(fields: Record<string, unknown>, requiredFields: string[]): void {
  const missing = requiredFields.filter((field) => !fields[field]);
  if (missing.length > 0) {
    throw new AppError(
      `Missing required fields: ${missing.join(', ')}`,
      'VALIDATION_ERROR',
      400,
      { missingFields: missing }
    );
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateStringLength(value: string, min: number, max: number, fieldName: string): void {
  if (value.length < min || value.length > max) {
    throw new AppError(
      `${fieldName} must be between ${min} and ${max} characters`,
      'VALIDATION_ERROR',
      400,
      { field: fieldName, min, max, actual: value.length }
    );
  }
}