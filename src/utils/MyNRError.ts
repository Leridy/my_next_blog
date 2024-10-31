/**
 * This class is used to create custom Next Response Errors.
 * @class MyNRError
 * @extends Error
 * @example
 * throw new MyNRError('This is a custom error message');
 * @example
 * throw new MyNRError('This is a custom error message', 400);
 * @example
 * throw new MyNRError('This is a custom error message', 400, {custom: 'data'});
 */
export class MyNRError extends Error {
  /**
   * The status code of the error.
   * @type {number}
   */
  statusCode: number;
  /**
   * The custom data of the error.
   * @type {any}
   */
  data: any;

  /**
   * Creates an instance of MyNRError.
   * @param {string} message The error message.
   * @param {number} [statusCode=500] The status code of the error.
   * @param {any} [data] The custom data of the error.
   */
  constructor(message: string, statusCode: number = 500, data?: any) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
  }

  /**
   * Returns the error message.
   * @returns {string} The error message.
   */
  getMessage(): string {
    return this.message;
  }

  /**
   * Returns the status code.
   * @returns {number} The status code.
   */
  getStatusCode(): number {
    return this.statusCode;
  }

  /**
   * Returns the custom data.
   * @returns {any} The custom data.
   */
  getData(): any {
    return this.data || Error.captureStackTrace(this, this.constructor);
  }
}
