import { Response } from "express";
import { StatusCodes, getReasonPhrase } from "http-status-codes";

export const respond = (
  response: Response,
  status: StatusCodes,
  data?: Record<string, unknown> | unknown[],
) => {
  response.status(status).json({
    status,
    data: data,
    errors: [],
  });
};

export const reject = (
  response: Response,
  status: StatusCodes,
  error: string | string[] = getReasonPhrase(status),
) => {
  response.status(status).json({
    status,
    data: {},
    errors: typeof error === "string" ? [error] : error,
  });
};
