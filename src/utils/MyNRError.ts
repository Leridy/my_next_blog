import {NextRequest, NextResponse} from "next/server";
import jwt from "jsonwebtoken";
import env from "../../.project.json";


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
   * The custom headers of the error.
   * @type {Record<string, string | string[]>}
   */
  headers: HeadersInit | undefined;

  /**
   * Creates an instance of MyNRError.
   * @param {string} message The error message.
   * @param {number} [statusCode=500] The status code of the error.
   * @param {any} [data] The custom data of the error.
   */
  constructor(message: string, statusCode: number = 500, operation?: Record<string, any>) {
    super(message);
    this.statusCode = statusCode;
    this.headers = operation?.headers;
    delete operation?.headers;
    this.data = operation;
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

  getHeaders(): HeadersInit | undefined {
    return this.headers
  }
}

export async function APIErrorHandler(req: NextRequest, res: NextResponse, next: Function) {
  try {

    /**
     * get token from cookie if token exists, use jwt to verify token, for expired token, redirect to homepage
     */

    try {
      const token = req.cookies.get('token')?.value
      if (token) {
        // verify token
        const user = jwt.verify(token, env.JWT_TOKEN_SECRET) as { exp: number, iat: number };
        if (user.exp * 1000 < Date.now()) throw new Error('token expired');

      }
    } catch (e) {
      console.error(e);
      return NextResponse.redirect(req.nextUrl.origin, {headers: {'Set-Cookie': `token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0;`}});
    }

    return await next(req, res);
  } catch (e) {
    if (e instanceof MyNRError) {
      return NextResponse.json({message: e.message, details: e.getData()}, {
        status: e.statusCode,
        headers: e.getHeaders()
      });
    }
    console.error(e);
    return NextResponse.json(e, {status: 400});
  }
}
