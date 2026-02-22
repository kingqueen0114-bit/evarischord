import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), 'public', 'ep001-storyboard.json');
        const data = await fs.readFile(filePath, 'utf8');
        return NextResponse.json(JSON.parse(data));
    } catch (error) {
        console.error('Failed to read storyboard:', error);
        return NextResponse.json({ error: 'Failed to read storyboard' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const storyboard = await request.json();
        const filePath = path.join(process.cwd(), 'public', 'ep001-storyboard.json');
        const backupPath = path.join(process.cwd(), 'public', 'ep001-storyboard.backup.json');

        // Create backup
        try {
            const currentData = await fs.readFile(filePath, 'utf8');
            await fs.writeFile(backupPath, currentData);
        } catch (e) {
            console.log('No existing storyboard to backup or backup failed');
        }

        // Save new data
        await fs.writeFile(filePath, JSON.stringify(storyboard, null, 2));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to save storyboard:', error);
        return NextResponse.json({ error: 'Failed to save storyboard' }, { status: 500 });
    }
}
