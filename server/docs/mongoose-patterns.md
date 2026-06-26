# Mongoose Patterns

## Populate (Referencing Documents)

```js
// Schema with reference
const logSchema = new mongoose.Schema({
  pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  note: String,
  date: { type: Date, default: Date.now },
});

// Query with population
const logs = await Log.find({ pet: petId }).populate('pet', 'name species');
//                                                              ^ only these fields
```

---

## Pagination

```js
export const getPetLogs = async (petId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  
  const [logs, total] = await Promise.all([
    Log.find({ pet: petId }).sort({ date: -1 }).skip(skip).limit(limit),
    Log.countDocuments({ pet: petId }),
  ]);

  return {
    data: logs,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
    },
  };
};
```

---

## Mongoose Middleware Hooks

```js
// Hash a field before saving (example: not needed with Firebase Auth, but useful for other things)
petSchema.pre('save', async function (next) {
  if (this.isModified('name')) {
    this.name = this.name.trim();
  }
  next();
});

// Clean up related documents on delete
petSchema.pre('deleteOne', { document: true }, async function (next) {
  await Log.deleteMany({ pet: this._id });
  next();
});
```

---

## Virtuals (Computed Fields)

```js
petSchema.virtual('ageInYears').get(function () {
  if (!this.birthDate) return null;
  const ms = Date.now() - this.birthDate.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24 * 365));
});

// Must enable virtuals in JSON output:
petSchema.set('toJSON', { virtuals: true });
petSchema.set('toObject', { virtuals: true });
```

---

## Useful Query Patterns

```js
// Find or create
const pet = await Pet.findOneAndUpdate(
  { name: 'Buddy', owner: uid },
  { $setOnInsert: { name: 'Buddy', owner: uid, species: 'dog' } },
  { upsert: true, new: true }
);

// Partial update (don't overwrite whole doc)
const updated = await Pet.findByIdAndUpdate(
  petId,
  { $set: updates },  // Only update provided fields
  { new: true, runValidators: true }
);

// Lean queries (plain JS object, faster, no Mongoose methods)
const pets = await Pet.find({ owner: uid }).lean();
```

---

## Index Best Practices

```js
// Single field index
owner: { type: String, required: true, index: true }

// Compound index (e.g., find logs by pet AND date range)
logSchema.index({ pet: 1, date: -1 });

// Unique index
email: { type: String, unique: true }
```

> Run `mongoose.set('debug', true)` in dev to log all queries and spot missing indexes.
