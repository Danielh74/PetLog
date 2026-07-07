# Auth Patterns — Firebase + Express

## Role-Based Access Control (RBAC)

Firebase tokens can carry custom claims (e.g., `admin: true`). Set them via Firebase Admin:

```js
// One-time script or admin endpoint
await admin.auth().setCustomUserClaims(uid, { role: 'admin' });
```

Then check in middleware:

```js
const requireAdmin = async (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admins only' });
  }
  next();
};

// Usage
router.delete('/users/:id', verifyToken, requireAdmin, deleteUser);
```

---

## Optional Auth (public route, enhanced if logged in)

```js
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(); // No token — continue as guest
  }
  try {
    const token = authHeader.split(' ')[1];
    req.user = await admin.auth().verifyIdToken(token);
  } catch {
    // Invalid token — treat as guest, don't block
  }
  next();
};
```

---

## Ownership Check Pattern

Always verify the requesting user owns the resource they're modifying:

```js
// In service layer
export const updatePet = async (petId, ownerUid, updates) => {
  const pet = await Pet.findById(petId);
  if (!pet) throw new AppError('Pet not found', 404);
  if (pet.owner !== ownerUid) throw new AppError('Forbidden', 403);
  
  Object.assign(pet, updates);
  return pet.save();
};
```

Never trust a `userId` from `req.body` — always use `req.user.uid` from the verified token.

---

## User Sync Pattern (Firebase ↔ MongoDB)

Firebase handles auth; MongoDB stores app data. Keep them in sync:

```js
// On first login, create a user doc if it doesn't exist
export const syncUser = async (req, res, next) => {
  const { uid, email, name } = req.user;
  
  await User.findOneAndUpdate(
    { firebaseUid: uid },
    { $setOnInsert: { firebaseUid: uid, email, name } },
    { upsert: true, new: true }
  );
  
  next();
};

// Apply to routes that need a MongoDB user doc
router.use(verifyToken, syncUser);
```
