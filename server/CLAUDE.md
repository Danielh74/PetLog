# PetLog — Server

This is the backend for PetLog, a pet health tracker app.
Claude Code should read and follow everything in this file on every session.

## Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js 24+ with native TypeScript type stripping |
| Framework | Express.js 5.x |
| Database | MongoDB via Mongoose 9.x |
| Auth | Firebase Admin SDK (token verification only — client handles sign-in) |
| Validation | Joi |
| Environment | dotenv |

---

## Folder Structure — Always follow this

```
server/
├── src/
│   ├── config/
│   │   ├── db.ts           # Mongoose connection
│   │   └── firebase.ts     # Firebase Admin init
│   ├── middleware/
│   │   ├── auth.ts         # verifyToken — Firebase ID token check
│   │   ├── errorHandler.ts # Global 4-arg error handler (must be last in app.ts)
│   │   └── validate.ts     # Zod schema validation factory
│   ├── models/             # Mongoose schemas + TypeScript interfaces
│   ├── controllers/        # Thin — parse req/res, call service, call next(error)
│   ├── services/           # All business logic and Mongoose queries go here
│   ├── routes/             # Express routers, one file per resource
│   ├── validators/         # Zod schemas, one file per resource
│   ├── utils/
│   │   └── AppError.ts     # Custom error class with status code
│   └── app.ts              # Express setup — no listen() call here
├── server.ts               # Entry point — connectDB() then app.listen()
├── .env                    # Never commit
├── .env.example            # Always commit (keys, no values)
└── package.json
```

**Rules that must not be broken:**
- `app.ts` never calls `listen()` — that's only in `server.ts`
- Controllers never contain business logic — that belongs in services
- Services never import `req` or `res` — they are pure functions that talk to Mongoose
- Never trust a userId from `req.body` — always use `req.user.uid` from the verified token
- All async controllers must wrap in try/catch and call `next(error)` on failure

---

## TypeScript Setup (Node 24 native type stripping)

No build step, no `tsc`, no `ts-node`. Just run TypeScript directly:

```json
// package.json
{
  "type": "module",
  "scripts": {
    "dev": "node --watch --experimental-strip-types server.ts",
    "start": "node --experimental-strip-types server.ts"
  }
}
```

All imports must use `.ts` extension. Node 24 native type stripping does **not** resolve `.js` → `.ts`:
```ts
import connectDB from './src/config/db.ts'; // ✅ correct
import connectDB from './src/config/db.js'; // ❌ wrong — Node won't find the file
```

**Typed `req.user`** — put this in `src/types/express.d.ts`:
```ts
import { DecodedIdToken } from 'firebase-admin/auth';
declare global {
  namespace Express {
    interface Request {
      user: DecodedIdToken;
    }
  }
}
```

---

## Key Implementations

### MongoDB Connection — `src/config/db.ts`
```ts
import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI!);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection failed:', (error as Error).message);
    process.exit(1);
  }
};

export default connectDB;
```

### Firebase Admin — `src/config/firebase.ts`
```ts
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export default admin;
```
> The `if (!admin.apps.length)` guard is required — without it, hot-reload will crash.
> The `.replace(/\\n/g, '\n')` fixes broken newlines when the private key is stored in `.env`.

### Auth Middleware — `src/middleware/auth.ts`
```ts
import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebase.js';

const verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized: No token provided' });
    return;
  }
  try {
    const token = authHeader.split(' ')[1];
    req.user = await admin.auth().verifyIdToken(token);
    next();
  } catch {
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

export default verifyToken;
```

### AppError — `src/utils/AppError.ts`
```ts
class AppError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
export default AppError;
```

### Error Handler — `src/middleware/errorHandler.ts`
```ts
import { Request, Response, NextFunction } from 'express';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  if (process.env.NODE_ENV === 'development') console.error(err.stack);
  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
```
> This MUST be the last `app.use()` call in `app.ts`. Express identifies it by the 4-argument signature.

### Validation Middleware — `src/middleware/validate.ts`
```ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

const validate = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction): void => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ message: 'Validation error', errors: result.error.flatten().fieldErrors });
    return;
  }
  req.body = result.data;
  next();
};

export default validate;
```

### Mongoose Model Pattern — `src/models/Pet.ts`
```ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IPet {
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'other';
  birthDate?: Date;
  owner: string; // Firebase UID
}

export interface IPetDocument extends IPet, Document {}

const petSchema = new Schema<IPetDocument>(
  {
    name: { type: String, required: true, trim: true },
    species: { type: String, enum: ['dog', 'cat', 'bird', 'other'], required: true },
    birthDate: { type: Date },
    owner: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

export default mongoose.model<IPetDocument>('Pet', petSchema);
```
> Always `timestamps: true`. Always `index: true` on fields used in `.find()` filters.

### Controller Pattern — `src/controllers/petController.ts`
```ts
import { Request, Response, NextFunction } from 'express';
import * as petService from '../services/petService.js';

export const getMyPets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pets = await petService.getPetsByOwner(req.user.uid);
    res.json({ success: true, data: pets });
  } catch (error) {
    next(error);
  }
};
```

### Service Pattern — `src/services/petService.ts`
```ts
import Pet from '../models/Pet.js';
import AppError from '../utils/AppError.js';

export const getPetsByOwner = async (ownerUid: string) => {
  return Pet.find({ owner: ownerUid });
};

export const deletePet = async (petId: string, ownerUid: string) => {
  const pet = await Pet.findById(petId);
  if (!pet) throw new AppError('Pet not found', 404);
  if (pet.owner !== ownerUid) throw new AppError('Forbidden', 403);
  await pet.deleteOne();
  return pet;
};
```

### Router Pattern — `src/routes/petRoutes.ts`
```ts
import { Router } from 'express';
import verifyToken from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { createPetSchema } from '../validators/petValidators.js';
import * as petController from '../controllers/petController.js';

const router = Router();
router.use(verifyToken); // All routes in this file require auth

router.get('/', petController.getMyPets);
router.post('/', validate(createPetSchema), petController.createPet);

export default router;
```

### app.ts
```ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'dotenv/config';
import petRoutes from './routes/petRoutes.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/pets', petRoutes);
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use(errorHandler); // LAST

export default app;
```

### server.ts
```ts
import 'dotenv/config';
import app from './src/app.js';
import connectDB from './src/config/db.js';

const PORT = process.env.PORT || 5000;

const start = async (): Promise<void> => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} [${process.env.NODE_ENV}]`);
  });
};

start();
```

---

## Environment Variables

```env
# .env (never commit)
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/petlog
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

```env
# .env.example (always commit — keys only, no values)
PORT=5000
MONGO_URI=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
NODE_ENV=development
CLIENT_URL=
```

---

## API Response Shape

Always respond in this shape for consistency:

```ts
// Success
res.json({ success: true, data: result });
res.status(201).json({ success: true, data: created });

// Error (handled by errorHandler middleware)
throw new AppError('Not found', 404);

// Validation error (handled by validate middleware)
res.status(400).json({ success: false, message: 'Validation error', errors: {...} });
```

---

## Common Mistakes — Never Do These

| ❌ Wrong | ✅ Right |
|---|---|
| Business logic in controller | Move it to service |
| `req.body.userId` for ownership | Use `req.user.uid` from token |
| `admin.initializeApp()` without guard | Wrap in `if (!admin.apps.length)` |
| `PRIVATE_KEY` without `.replace(/\\n/g, '\n')` | Always apply the replace |
| `next(error)` missing in async controller | Always wrap in try/catch + next |
| `app.use(errorHandler)` before routes | It must be the very last middleware |
| Import with `.js` extension for local files | Always use `.ts` extension — Node 24 strip-types won't resolve `.js` to `.ts` |
| Trust `userId` from request body | Only trust `req.user.uid` from Firebase token |

---

## Extended Docs

For deeper patterns, see:
- `docs/auth-patterns.md` — RBAC, optional auth, user sync
- `docs/mongoose-patterns.md` — populate, pagination, hooks, virtuals, indexes
- `docs/deployment.md` — Render setup, Atlas IP, monorepo deploy
