export class AppError extends Error {
  statusCode: number;
  errorCode?: string;
  errors?: Record<string, string>;

  constructor(
    message: string,
    statusCode = 400,
    errorCode?: string,
    errors?: Record<string, string>,
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errors = errors;
  }
}
