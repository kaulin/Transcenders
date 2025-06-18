import { FastifyInstance } from 'fastify';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream';
import { promisify } from 'util';
const pump = promisify(pipeline);

export async function registerAvatarUpload(fastify: FastifyInstance) {
  fastify.post(
    '/user/upload-avatar',
    {
      schema: {
        consumes: ['multipart/form-data'],
        body: {
          type: 'object',
          properties: {
            file: { type: 'string', format: 'binary' },
          },
          required: ['file'],
        },
      },
    },
    async function (req, reply) {
      const data = await req.file();

      // Only allow image uploads
      // if (!data.mimetype.startsWith('image/')) {
      //   reply.statusCode = 400;
      //   return 'error, only images';
      // }

      // Generate a unique filename (e.g., userId + timestamp + ext)
      const ext = path.extname(data.filename);
      // const userId = data.fields.userId?.value || 'anonymous';
      const userId = 1;
      const uniqueName = `${userId}-${Date.now()}${ext}`;
      const uploadDir = path.join(__dirname, '../../uploads/avatars');
      const filePath = path.join(uploadDir, uniqueName);

      // Ensure upload directory exists
      fs.mkdirSync(uploadDir, { recursive: true });

      // Save the file
      await pump(data.file, fs.createWriteStream(filePath));

      return { success: true, filename: uniqueName };
    },
  );
}
