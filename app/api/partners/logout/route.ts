import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Déconnexion réussie.' });
  response.cookies.delete('partner_session');
  return response;
}
