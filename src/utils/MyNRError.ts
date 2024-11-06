import {NextRequest, NextResponse} from "next/server";
import * as jose from 'jose';
import {User} from "@prisma/client";


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
  data: unknown;

  /**
   * The custom headers of the error.
   * @type {Record<string, string | string[]>}
   */
  headers: unknown;


  /**
   * Creates an instance of MyNRError.
   * @param {string} message The error message.
   * @param {number} [statusCode=500] The status code of the error.
   * @param optional
   */
  constructor(message: string, statusCode: number = 500, optional?: Record<string, unknown>) {
    super(message);
    this.statusCode = statusCode;
    this.headers = optional?.headers;
    delete optional?.headers;
    this.data = optional;
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
  getData(): unknown {
    return this.data || Error.captureStackTrace(this, this.constructor);
  }

  getHeaders(): HeadersInit | undefined {
    return this.headers as HeadersInit;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export async function APIErrorHandler(req: NextRequest, res: NextResponse, next: Function) {
  try {

    /**
     * get token from cookie if token exists, use jwt to verify token, for expired token, redirect to homepage
     */

    try {
      const token = req.cookies.get('token')?.value
      if (token) {
        // verify token
        const secret = new TextEncoder().encode(process.env.JWT_TOKEN_SECRET || '');
        // const user = jwt.verify(token, secret) as { exp: number, iat: number };
        const {payload: user} = await jose.jwtVerify<User>(token, secret);
        console.log(user);
        if ((user?.exp || 1) * 1000 < Date.now()) throw new Error('token expired');
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
    if (e instanceof Error) {
      return NextResponse.json({message: e.message}, {status: 500});
    }
    return NextResponse.json(e, {status: 400});
  }
}
