import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

const DIRS = [
  "public/assets/photos",
  "public/assets/music",
  "public/assets/video",
  "public/assets/sounds",
  "assets/photos",
  "assets/music",
  "assets/video",
  "assets/sounds",
  "public/images",
  "public/music",
  "public/video",
  "images",
  "music",
  "video",
];

for (const dir of DIRS) {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
}

/**
 * Automatically checks if the user uploaded files named 1.jpg..12.jpg or photo1.jpg..photo12.jpg
 * or birthday-song.mp3 or final-surprise.mp4 in root or asset folders and syncs them so all paths work.
 */
function syncMediaLocations() {
  try {
    // Check 1.jpg .. 12.jpg in root, assets/photos, public/assets/photos, images
    const searchPhotoDirs = [
      __dirname,
      path.join(__dirname, "assets/photos"),
      path.join(__dirname, "public/assets/photos"),
      path.join(__dirname, "images"),
      path.join(__dirname, "public/images"),
    ];

    for (let i = 1; i <= 12; i++) {
      const candidateNames = [`${i}.jpg`, `${i}.jpeg`, `${i}.png`, `photo${i}.jpeg`, `photo${i}.png`];
      for (const dir of searchPhotoDirs) {
        if (!fs.existsSync(dir)) continue;
        for (const name of candidateNames) {
          const candidatePath = path.join(dir, name);
          if (fs.existsSync(candidatePath)) {
            const buf = fs.readFileSync(candidatePath);
            writePhotoSlot(i, buf);
          }
        }
      }
    }

    // Check if photo1.jpg..photo12.jpg was uploaded to root or assets/photos and sync to public/assets/photos
    for (let i = 1; i <= 12; i++) {
      const rootPhoto = path.join(__dirname, `photo${i}.jpg`);
      if (fs.existsSync(rootPhoto)) {
        writePhotoSlot(i, fs.readFileSync(rootPhoto));
      }
    }

    // Check root for birthday-song.mp3 or final-surprise.mp4
    const rootMp3 = path.join(__dirname, "birthday-song.mp3");
    if (fs.existsSync(rootMp3)) {
      writeMusicSlot(fs.readFileSync(rootMp3));
    }

    const rootMp4 = path.join(__dirname, "final-surprise.mp4");
    if (fs.existsSync(rootMp4)) {
      writeVideoSlot(fs.readFileSync(rootMp4));
    }
  } catch (_err) {
    // Ignore sync errors silently
  }
}

function writePhotoSlot(index: number, buffer: Buffer) {
  const targets = [
    path.join(__dirname, `public/assets/photos/photo${index}.jpg`),
    path.join(__dirname, `assets/photos/photo${index}.jpg`),
  ];
  if (index <= 10) {
    targets.push(path.join(__dirname, `public/images/photo${index}.jpg`));
    targets.push(path.join(__dirname, `images/photo${index}.jpg`));
  }
  const distPhotoDir = path.join(__dirname, "dist/assets/photos");
  if (fs.existsSync(distPhotoDir)) {
    targets.push(path.join(distPhotoDir, `photo${index}.jpg`));
  }
  for (const t of targets) {
    fs.mkdirSync(path.dirname(t), { recursive: true });
    fs.writeFileSync(t, buffer);
  }
}

function writeMusicSlot(buffer: Buffer) {
  const targets = [
    path.join(__dirname, "public/assets/music/birthday-song.mp3"),
    path.join(__dirname, "assets/music/birthday-song.mp3"),
    path.join(__dirname, "public/music/birthday-song.mp3"),
    path.join(__dirname, "music/birthday-song.mp3"),
  ];
  const distMusicDir = path.join(__dirname, "dist/assets/music");
  if (fs.existsSync(distMusicDir)) {
    targets.push(path.join(distMusicDir, "birthday-song.mp3"));
  }
  for (const t of targets) {
    fs.mkdirSync(path.dirname(t), { recursive: true });
    fs.writeFileSync(t, buffer);
  }
}

function writeVideoSlot(buffer: Buffer) {
  const targets = [
    path.join(__dirname, "public/assets/video/final-surprise.mp4"),
    path.join(__dirname, "assets/video/final-surprise.mp4"),
    path.join(__dirname, "public/video/surprise.mp4"),
    path.join(__dirname, "video/surprise.mp4"),
  ];
  const distVideoDir = path.join(__dirname, "dist/assets/video");
  if (fs.existsSync(distVideoDir)) {
    targets.push(path.join(distVideoDir, "final-surprise.mp4"));
  }
  for (const t of targets) {
    fs.mkdirSync(path.dirname(t), { recursive: true });
    fs.writeFileSync(t, buffer);
  }
}

syncMediaLocations();

async function startServer() {
  const app = express();

  // API Endpoint: Upload & permanently save personal photos, music, or video directly into project files
  app.post(
    "/api/upload-media",
    express.raw({ type: "*/*", limit: "350mb" }),
    (req, res) => {
      try {
        const slot = String(req.query.slot || "").trim();
        const body = req.body as Buffer;

        if (!body || !Buffer.isBuffer(body) || body.length === 0) {
          res.status(400).json({ ok: false, error: "Empty file buffer" });
          return;
        }

        if (slot.startsWith("photo")) {
          const num = parseInt(slot.replace("photo", ""), 10);
          if (num >= 1 && num <= 12) {
            writePhotoSlot(num, body);
            res.json({
              ok: true,
              slot: `photo${num}`,
              path: `assets/photos/photo${num}.jpg`,
              bytes: body.length,
            });
            return;
          }
        }

        if (slot === "music") {
          writeMusicSlot(body);
          res.json({
            ok: true,
            slot: "music",
            path: "assets/music/birthday-song.mp3",
            bytes: body.length,
          });
          return;
        }

        if (slot === "video") {
          writeVideoSlot(body);
          res.json({
            ok: true,
            slot: "video",
            path: "assets/video/final-surprise.mp4",
            bytes: body.length,
          });
          return;
        }

        res.status(400).json({ ok: false, error: "Invalid slot name" });
      } catch (err) {
        res.status(500).json({
          ok: false,
          error: err instanceof Error ? err.message : "Upload failed",
        });
      }
    }
  );

  // Serve static media folders with no-cache headers so newly replaced files show up immediately
  const noCacheStatic = {
    etag: false,
    lastModified: false,
    setHeaders: (res: express.Response) => {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    },
  };

  app.use("/assets", express.static(path.join(__dirname, "public/assets"), noCacheStatic));
  app.use("/assets", express.static(path.join(__dirname, "assets"), noCacheStatic));
  app.use("/images", express.static(path.join(__dirname, "public/images"), noCacheStatic));
  app.use("/music", express.static(path.join(__dirname, "public/music"), noCacheStatic));
  app.use("/video", express.static(path.join(__dirname, "public/video"), noCacheStatic));

  const isProd = process.env.NODE_ENV === "production" && fs.existsSync(path.join(__dirname, "dist"));

  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "public"), noCacheStatic));
    app.use(express.static(path.join(__dirname, "dist"), noCacheStatic));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(__dirname, "dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Birthday website server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
