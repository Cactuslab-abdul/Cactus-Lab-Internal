import { NextRequest } from 'next/server';

export function isAdminRequest(req: NextRequest): boolean {
  const cookie = req.cookies.get('portal-admin');
  return !!cookie && !!process.env.PORTAL_ADMIN_PASSWORD && cookie.value === process.env.PORTAL_ADMIN_PASSWORD;
}
