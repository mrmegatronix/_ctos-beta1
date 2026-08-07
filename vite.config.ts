import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'child_process';

const getCommitInfo = () => {
  try {
    return execSync('git log -1 --format="%cd" --date=format:"%Y-%m-%d %H:%M:%S"').toString().trim();
  } catch (e) {
    return new Date().toISOString().replace('T', ' ').split('.')[0];
  }
};

function publicFileServerPlugin(): Plugin {
  return {
    name: 'public-file-server-plugin',
    configureServer(server) {
      const publicDir = path.resolve(__dirname, 'public');

      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';

        // 1. GET /api/list-public
        if (req.method === 'GET' && url.startsWith('/api/list-public')) {
          try {
            const filesList: Array<{
              name: string;
              relativePath: string;
              urlPath: string;
              size: number;
              modified: string;
              extension: string;
            }> = [];

            const scanDir = (dir: string) => {
              if (!fs.existsSync(dir)) return;
              const entries = fs.readdirSync(dir, { withFileTypes: true });
              for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                  if (entry.name !== '.git' && entry.name !== 'node_modules') {
                    scanDir(fullPath);
                  }
                } else if (entry.isFile()) {
                  const stats = fs.statSync(fullPath);
                  const rel = path.relative(publicDir, fullPath);
                  filesList.push({
                    name: entry.name,
                    relativePath: rel,
                    urlPath: '/' + rel.replace(/\\/g, '/'),
                    size: stats.size,
                    modified: stats.mtime.toISOString(),
                    extension: path.extname(entry.name).toLowerCase()
                  });
                }
              }
            };

            scanDir(publicDir);

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, count: filesList.length, files: filesList }));
            return;
          } catch (err: any) {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: err.message }));
            return;
          }
        }

        // 2. POST /api/upload-public
        if (req.method === 'POST' && url.startsWith('/api/upload-public')) {
          try {
            let body = '';
            req.on('data', chunk => {
              body += chunk;
            });

            req.on('end', () => {
              try {
                const payload = JSON.parse(body);
                const { filename, subfolder = '', base64Content } = payload;

                if (!filename || !base64Content) {
                  res.setHeader('Content-Type', 'application/json');
                  res.statusCode = 400;
                  res.end(JSON.stringify({ success: false, error: 'Missing filename or base64Content' }));
                  return;
                }

                // Sanitize filename and subfolder
                const safeSubfolder = subfolder.replace(/^(\.\.[\/\\])+/, '').replace(/^\/+/, '');
                const safeFilename = path.basename(filename);

                const targetDir = path.resolve(publicDir, safeSubfolder);
                const targetFilePath = path.resolve(targetDir, safeFilename);

                // Security check to avoid path traversal outside of publicDir
                if (!targetFilePath.startsWith(publicDir)) {
                  res.setHeader('Content-Type', 'application/json');
                  res.statusCode = 403;
                  res.end(JSON.stringify({ success: false, error: 'Target path outside of public directory is forbidden' }));
                  return;
                }

                if (!fs.existsSync(targetDir)) {
                  fs.mkdirSync(targetDir, { recursive: true });
                }

                const buffer = Buffer.from(base64Content, 'base64');
                fs.writeFileSync(targetFilePath, buffer);

                const relPath = path.relative(publicDir, targetFilePath);
                const publicUrl = '/' + relPath.replace(/\\/g, '/');

                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 200;
                res.end(JSON.stringify({
                  success: true,
                  filename: safeFilename,
                  relativePath: relPath,
                  urlPath: publicUrl,
                  size: buffer.length,
                  message: `Successfully uploaded ${safeFilename} to ${publicUrl}`
                }));
              } catch (parseErr: any) {
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 400;
                res.end(JSON.stringify({ success: false, error: 'Invalid JSON payload: ' + parseErr.message }));
              }
            });
            return;
          } catch (err: any) {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: err.message }));
            return;
          }
        }

        // 3. DELETE /api/delete-public
        if (req.method === 'DELETE' && url.startsWith('/api/delete-public')) {
          try {
            const parsedUrl = new URL(url, 'http://localhost');
            const targetRel = parsedUrl.searchParams.get('path');

            if (!targetRel) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, error: 'Missing path parameter' }));
              return;
            }

            const cleanRel = targetRel.replace(/^\/+/, '');
            const targetFilePath = path.resolve(publicDir, cleanRel);

            if (!targetFilePath.startsWith(publicDir)) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 403;
              res.end(JSON.stringify({ success: false, error: 'Path outside of public directory' }));
              return;
            }

            if (fs.existsSync(targetFilePath)) {
              fs.unlinkSync(targetFilePath);
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, message: `Deleted ${cleanRel}` }));
            } else {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 404;
              res.end(JSON.stringify({ success: false, error: 'File not found' }));
            }
            return;
          } catch (err: any) {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: err.message }));
            return;
          }
        }

        next();
      });
    }
  };
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: './',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), publicFileServerPlugin()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
        '__COMMIT_INFO__': JSON.stringify(getCommitInfo())
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});

