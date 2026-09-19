import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

function getUploadDir(): string {
  // Try common paths in Docker or local dev
  const candidates = [
    path.join(process.cwd(), 'public', 'uploads'),
    path.join('/app', 'public', 'uploads'),
    path.join(process.cwd(), 'uploads'),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(dir)) return dir;
  }
  // Default to public/uploads
  const defaultDir = path.join(process.cwd(), 'public', 'uploads');
  try {
    fs.mkdirSync(defaultDir, { recursive: true });
  } catch {}
  return defaultDir;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const safeFilename = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '');
    if (!safeFilename) {
      return new NextResponse('Fichier introuvable', { status: 404 });
    }

    const uploadDir = getUploadDir();
    const filePath = path.join(uploadDir, safeFilename);

    if (!fs.existsSync(filePath)) {
      return new NextResponse('Fichier non trouvé', { status: 404 });
    }

    const ext = path.extname(safeFilename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
    };
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Erreur lecture upload:', error);
    return new NextResponse('Erreur serveur', { status: 500 });
  }
}
