import { describe, expect, it } from 'vitest';
import {
  ConversionFailedError,
  CorruptedDataError,
  ExportFailedError,
  InsecureContextError,
  NoDeviceError,
  PermissionDeniedError,
  QuotaExceededError,
  RecorderError,
  RecordingFailedError,
  toRecorderError,
  UnsupportedBrowserError,
} from '@/lib/errors';

describe('RecorderError base', () => {
  it('defaults to UNKNOWN code and RecorderError name', () => {
    const error = new RecorderError('boom');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(RecorderError);
    expect(error.message).toBe('boom');
    expect(error.name).toBe('RecorderError');
    expect(error.code).toBe('UNKNOWN');
    expect(error.causeError).toBeUndefined();
  });

  it('accepts an explicit code and cause', () => {
    const cause = new Error('root');
    const error = new RecorderError('nope', 'NOT_READABLE', cause);
    expect(error.code).toBe('NOT_READABLE');
    expect(error.causeError).toBe(cause);
  });
});

describe('error subclasses', () => {
  it('sets stable codes and names', () => {
    expect(new UnsupportedBrowserError().code).toBe('UNSUPPORTED_BROWSER');
    expect(new InsecureContextError().code).toBe('INSECURE_CONTEXT');
    expect(new PermissionDeniedError().code).toBe('PERMISSION_DENIED');
    expect(new NoDeviceError().code).toBe('NO_DEVICE');
    expect(new RecordingFailedError().code).toBe('RECORDING_FAILED');
    expect(new QuotaExceededError().code).toBe('QUOTA_EXCEEDED');
    expect(new CorruptedDataError().code).toBe('CORRUPTED_DATA');
    expect(new ExportFailedError().code).toBe('EXPORT_FAILED');
    expect(new ConversionFailedError().code).toBe('CONVERSION_FAILED');
  });

  it('is instanceof both the subclass and RecorderError', () => {
    const error = new PermissionDeniedError();
    expect(error).toBeInstanceOf(PermissionDeniedError);
    expect(error).toBeInstanceOf(RecorderError);
    expect(error.name).toBe('PermissionDeniedError');
  });

  it('forwards the cause on cause-aware subclasses', () => {
    const cause = new Error('denied');
    expect(new PermissionDeniedError(undefined, cause).causeError).toBe(cause);
    expect(new NoDeviceError('none', cause).causeError).toBe(cause);
    expect(new CorruptedDataError('bad', cause).causeError).toBe(cause);
  });

  it('uses default messages when none provided', () => {
    expect(new UnsupportedBrowserError().message).toContain('does not support');
    expect(new InsecureContextError().message).toContain('secure context');
    expect(new QuotaExceededError().message).toContain('storage');
  });
});

describe('toRecorderError', () => {
  it('passes RecorderError instances through unchanged', () => {
    const original = new NoDeviceError('none');
    expect(toRecorderError(original)).toBe(original);
  });

  it('maps DOMException names to typed errors', () => {
    expect(toRecorderError(new DOMException('nope', 'NotAllowedError'))).toBeInstanceOf(
      PermissionDeniedError
    );
    expect(toRecorderError(new DOMException('nope', 'NotFoundError'))).toBeInstanceOf(
      NoDeviceError
    );
    expect(toRecorderError(new DOMException('nope', 'NotReadableError')).code).toBe('NOT_READABLE');
    expect(toRecorderError(new DOMException('nope', 'AbortError')).code).toBe('ABORTED');
    expect(toRecorderError(new DOMException('nope', 'QuotaExceededError'))).toBeInstanceOf(
      QuotaExceededError
    );
    expect(toRecorderError(new DOMException('nope', 'SecurityError'))).toBeInstanceOf(
      InsecureContextError
    );
  });

  it('wraps unknown DOMExceptions, Errors and non-errors', () => {
    expect(toRecorderError(new DOMException('mystery')).code).toBe('UNKNOWN');
    const plain = toRecorderError(new Error('generic'));
    expect(plain).toBeInstanceOf(RecorderError);
    expect(plain.code).toBe('UNKNOWN');
    expect(plain.causeError).toBeInstanceOf(Error);
    expect(toRecorderError('a string').message).toBe('An unknown error occurred.');
    expect(toRecorderError(undefined).message).toBe('An unknown error occurred.');
  });
});
