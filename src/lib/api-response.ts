import { NextResponse } from "next/server";

interface ApiResponseData {
  data?: unknown;
  error?: string;
  message?: string;
}

export function apiSuccess(data: unknown, status = 200) {
  return NextResponse.json({ data } as ApiResponseData, { status });
}

export function apiError(error: string, status = 400) {
  return NextResponse.json({ error } as ApiResponseData, { status });
}
