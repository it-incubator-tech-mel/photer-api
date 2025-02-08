// export class CustomError extends HttpException {
export class CustomError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly errorMessages?: { field: string; message: string }[],
    message: string = 'An error occurred',
  ) {
    super(message);
  }
}
