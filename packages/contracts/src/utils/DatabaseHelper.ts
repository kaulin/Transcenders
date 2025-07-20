import fs from 'fs';

export class DatabaseHelper {
  static getSqlFromFile(filePath: string): string | null {
    if (!fs.existsSync(filePath)) {
      console.log(`SQL file not found: ${filePath}`);
      return null;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    return content;
  }
}
