/**
 * Typed error hierarchy for the recorder application.
 * Every module throws a `RecorderError` subclass so UI code can branch on
 * `error.code` instead of brittle string matching.
 */

export type ErrorCode =
  | 'UNKNOWN'
  | 'UNSUPPORTED_BROWSER'
  | 'INSECURE_CONTEXT'
  | 'PERMISSION_DENIED'
  | 'NO_DEVICE'
  | 'NOT_ALLOWED'
  | 'NOT_READABLE'
  | 'ABORTED'
  | 'RECORDING_FAILED'
  | 'STORAGE_FULL'
  | 'QUOTA_EXCEEDED'
  | 'CORRUPTED_DATA'
  | 'NOT_FOUND'
  | 'TRIM_FAILED'
  | 'EXPORT_FAILED'
  | 'CONVERSION_FAILED'
  | 'WORKER_UNAVAILABLE';

export class RecorderError extends Error {
  readonly code: ErrorCode;
  readonly causeError?: unknown;

  constructor(message: string, code: ErrorCode = 'UNKNOWN', cause?: unknown) {
    super(message);
    this.name = 'RecorderError';
    this.code = code;
    this.causeError = cause;
  }
}

export class UnsupportedBrowserError extends RecorderError {
  constructor(message = 'This browser does not support screen recording.') {
    super(message, 'UNSUPPORTED_BROWSER');
    this.name = 'UnsupportedBrowserError';
  }
}

export class InsecureContextError extends RecorderError {
  constructor(message = 'Screen recording requires a secure context (HTTPS or localhost).') {
    super(message, 'INSECURE_CONTEXT');
    this.name = 'InsecureContextError';
  }
}

export class PermissionDeniedError extends RecorderError {
  constructor(message = 'Permission to access the requested media was denied.', cause?: unknown) {
    super(message, 'PERMISSION_DENIED', cause);
    this.name = 'PermissionDeniedError';
  }
}

export class NoDeviceError extends RecorderError {
  constructor(message = 'No matching media device was found.', cause?: unknown) {
    super(message, 'NO_DEVICE', cause);
    this.name = 'NoDeviceError';
  }
}

export class RecordingFailedError extends RecorderError {
  constructor(message = 'Recording failed unexpectedly.', cause?: unknown) {
    super(message, 'RECORDING_FAILED', cause);
    this.name = 'RecordingFailedError';
  }
}

export class QuotaExceededError extends RecorderError {
  constructor(message = 'Not enough storage space to save the recording.') {
    super(message, 'QUOTA_EXCEEDED');
    this.name = 'QuotaExceededError';
  }
}

export class CorruptedDataError extends RecorderError {
  constructor(message = 'Stored recording data is corrupted or unreadable.', cause?: unknown) {
    super(message, 'CORRUPTED_DATA', cause);
    this.name = 'CorruptedDataError';
  }
}

export class ExportFailedError extends RecorderError {
  constructor(message = 'Failed to export the recording.', cause?: unknown) {
    super(message, 'EXPORT_FAILED', cause);
    this.name = 'ExportFailedError';
  }
}

export class ConversionFailedError extends RecorderError {
  constructor(message = 'Failed to convert the recording.', cause?: unknown) {
    super(message, 'CONVERSION_FAILED', cause);
    this.name = 'ConversionFailedError';
  }
}

export function toRecorderError(error: unknown): RecorderError {
  if (error instanceof RecorderError) return error;
  if (error instanceof DOMException) {
    switch (error.name) {
      case 'NotAllowedError':
        return new PermissionDeniedError('Permission to access media was denied.', error);
      case 'NotFoundError':
        return new NoDeviceError('No matching media device was found.', error);
      case 'NotReadableError':
        return new RecorderError('A media device is already in use.', 'NOT_READABLE', error);
      case 'AbortError':
        return new RecorderError('The operation was aborted.', 'ABORTED', error);
      case 'QuotaExceededError':
        return new QuotaExceededError();
      case 'SecurityError':
        return new InsecureContextError();
      default:
        return new RecorderError(error.message, 'UNKNOWN', error);
    }
  }
  if (error instanceof Error) {
    return new RecorderError(error.message, 'UNKNOWN', error);
  }
  return new RecorderError('An unknown error occurred.');
}
