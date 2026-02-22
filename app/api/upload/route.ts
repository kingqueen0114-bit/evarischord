import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const panelId = formData.get('panelId') as string;

        if (!file || !panelId) {
            return NextResponse.json({ error: 'File and panelId are required' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const publicDir = path.join(process.cwd(), 'public', 'panels');
        const targetPath = path.join(publicDir, `${panelId}.png`);

        // Basic versioning for original file if it exists
        try {
            await fs.access(targetPath);
            const timestamp = Date.now();
            const backupPath = path.join(publicDir, `${panelId}_v${timestamp}.png`);
            await fs.copyFile(targetPath, backupPath);
        } catch {
            // File doesn't exist yet, which is fine
        }

        await fs.writeFile(targetPath, buffer);

        // Provide a cache-busting URL so the image updates in the browser
        const src = `/panels/${panelId}.png?t=${Date.now()}`;

        return NextResponse.json({ success: true, src });
    } catch (error) {
        console.error('Upload failed:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
