// Hand-written OpenAPI 3.0 document served via swagger-ui-express at /api-docs.

// --- small local helpers to keep the paths section below readable ---

function ref(name: string) {
  return { $ref: `#/components/schemas/${name}` };
}

function envelope(dataSchema?: unknown) {
  return {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string' },
      ...(dataSchema ? { data: dataSchema } : {}),
    },
  };
}

function errorSchema() {
  return {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      message: { type: 'string' },
      errors: { type: 'object', additionalProperties: { type: 'array', items: { type: 'string' } } },
    },
  };
}

function jsonOf(schema: unknown) {
  return { 'application/json': { schema } };
}

function jsonBody(schema: unknown) {
  return { required: true, content: jsonOf(schema) };
}

function pathParam(name: string, type: string, description?: string) {
  return { name, in: 'path', required: true, schema: { type }, ...(description ? { description } : {}) };
}

const petIdParam = pathParam('id', 'string', "The pet's id");
const recordIdParam = pathParam('rid', 'string', "The health record's id");

const unauthorized = { description: 'Missing or invalid Firebase ID token', content: jsonOf(errorSchema()) };
const forbidden = { description: 'Authenticated, but not the owner of this resource', content: jsonOf(errorSchema()) };
const notFound = { description: 'Resource not found', content: jsonOf(errorSchema()) };
const validationError = { description: 'Request body failed validation', content: jsonOf(errorSchema()) };

const SPECIES = ['dog', 'cat', 'bird', 'rabbit', 'other'];
const RECORD_TYPES = ['vaccination', 'vet_visit', 'medication', 'weight', 'grooming', 'other'];

// --- the document itself ---

const openapiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'PetLog API',
    version: '1.0.0',
    description:
      'REST API for PetLog — a pet health tracker. Manages pets, health records, and reminders, ' +
      'and provides an AI-assisted symptom checker. All endpoints respond with the envelope ' +
      '`{ success, data?, message? }` on success or `{ success: false, message, errors? }` on failure.',
  },
  servers: [{ url: '/api', description: 'API root (relative to the server origin)' }],
  tags: [
    { name: 'Auth', description: 'Current-user session info' },
    { name: 'Pets', description: 'Pet profiles and public share links' },
    { name: 'Health Records', description: "A pet's vaccination/vet-visit/medication/weight/grooming log" },
    { name: 'Reminders', description: 'Due-date tasks for a pet' },
  ],
  paths: {
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get the current authenticated user',
        description: 'Looks up (and lazily creates) the User document for the Firebase-verified caller.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'User fetched successfully', content: jsonOf(envelope(ref('User'))) },
          401: unauthorized,
        },
      },
    },

    '/pets/share/{token}': {
      get: {
        tags: ['Pets'],
        summary: 'Get a read-only pet profile by share token',
        description: 'Public endpoint — no authentication required. Used by `/share/:token` on the client.',
        parameters: [pathParam('token', 'string', "The pet's shareToken")],
        responses: {
          200: { description: 'Pet shared successfully', content: jsonOf(envelope(ref('Pet'))) },
          404: notFound,
        },
      },
    },

    '/pets': {
      get: {
        tags: ['Pets'],
        summary: "List the caller's pets",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'OK', content: jsonOf(envelope({ type: 'array', items: ref('Pet') })) },
          401: unauthorized,
        },
      },
      post: {
        tags: ['Pets'],
        summary: 'Create a pet',
        security: [{ bearerAuth: [] }],
        requestBody: jsonBody(ref('CreatePetInput')),
        responses: {
          201: { description: 'Pet created successfully', content: jsonOf(envelope(ref('Pet'))) },
          400: validationError,
          401: unauthorized,
        },
      },
    },

    '/pets/{id}': {
      get: {
        tags: ['Pets'],
        summary: 'Get one pet by id',
        security: [{ bearerAuth: [] }],
        parameters: [petIdParam],
        responses: {
          200: { description: 'Pet fetched successfully', content: jsonOf(envelope(ref('Pet'))) },
          401: unauthorized,
          403: forbidden,
          404: notFound,
        },
      },
      patch: {
        tags: ['Pets'],
        summary: 'Update a pet',
        security: [{ bearerAuth: [] }],
        parameters: [petIdParam],
        requestBody: jsonBody(ref('UpdatePetInput')),
        responses: {
          200: { description: 'Pet updated successfully', content: jsonOf(envelope(ref('Pet'))) },
          400: validationError,
          401: unauthorized,
          403: forbidden,
          404: notFound,
        },
      },
      delete: {
        tags: ['Pets'],
        summary: 'Delete a pet',
        security: [{ bearerAuth: [] }],
        parameters: [petIdParam],
        responses: {
          200: { description: 'Pet deleted successfully', content: jsonOf(envelope()) },
          401: unauthorized,
          403: forbidden,
          404: notFound,
        },
      },
    },

    '/pets/{id}/symptom-check': {
      post: {
        tags: ['Pets'],
        summary: 'Run the AI symptom checker for a pet',
        description:
          'Sends the described symptoms, along with the pet\'s species/breed/age, to Claude and returns ' +
          'possible causes, an urgency level, and a disclaimer. Provides general guidance only — never a diagnosis.',
        security: [{ bearerAuth: [] }],
        parameters: [petIdParam],
        requestBody: jsonBody(ref('SymptomCheckInput')),
        responses: {
          200: {
            description: 'Symptom check completed successfully',
            content: jsonOf(envelope(ref('SymptomCheckResult'))),
          },
          400: validationError,
          401: unauthorized,
          403: forbidden,
          404: notFound,
          500: { description: 'The AI response could not be parsed', content: jsonOf(errorSchema()) },
        },
      },
    },

    '/pets/{id}/reminders': {
      post: {
        tags: ['Reminders'],
        summary: 'Create a reminder for a pet',
        security: [{ bearerAuth: [] }],
        parameters: [petIdParam],
        requestBody: jsonBody(ref('CreateReminderInput')),
        responses: {
          201: { description: 'Reminder created successfully', content: jsonOf(envelope(ref('Reminder'))) },
          400: validationError,
          401: unauthorized,
          403: forbidden,
          404: notFound,
        },
      },
    },

    '/pets/{id}/records': {
      get: {
        tags: ['Health Records'],
        summary: 'List health records for a pet (paginated)',
        security: [{ bearerAuth: [] }],
        parameters: [
          petIdParam,
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, default: 10 } },
        ],
        responses: {
          200: {
            description: 'Health records fetched successfully',
            content: jsonOf(envelope(ref('PaginatedHealthRecords'))),
          },
          401: unauthorized,
          403: forbidden,
          404: notFound,
        },
      },
      post: {
        tags: ['Health Records'],
        summary: 'Add a health record for a pet',
        security: [{ bearerAuth: [] }],
        parameters: [petIdParam],
        requestBody: jsonBody(ref('CreateHealthRecordInput')),
        responses: {
          201: {
            description: 'Health record created successfully',
            content: jsonOf(envelope(ref('HealthRecord'))),
          },
          400: validationError,
          401: unauthorized,
          403: forbidden,
          404: notFound,
        },
      },
    },

    '/pets/{id}/records/{rid}': {
      patch: {
        tags: ['Health Records'],
        summary: 'Update a health record',
        security: [{ bearerAuth: [] }],
        parameters: [petIdParam, recordIdParam],
        requestBody: jsonBody(ref('UpdateHealthRecordInput')),
        responses: {
          200: {
            description: 'Health record updated successfully',
            content: jsonOf(envelope(ref('HealthRecord'))),
          },
          400: validationError,
          401: unauthorized,
          403: forbidden,
          404: notFound,
        },
      },
      delete: {
        tags: ['Health Records'],
        summary: 'Delete a health record',
        security: [{ bearerAuth: [] }],
        parameters: [petIdParam, recordIdParam],
        responses: {
          200: { description: 'Health record deleted successfully', content: jsonOf(envelope()) },
          401: unauthorized,
          403: forbidden,
          404: notFound,
        },
      },
    },

    '/reminders': {
      get: {
        tags: ['Reminders'],
        summary: "List the caller's reminders",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Reminders fetched successfully',
            content: jsonOf(envelope({ type: 'array', items: ref('Reminder') })),
          },
          401: unauthorized,
        },
      },
    },

    '/reminders/{rid}': {
      patch: {
        tags: ['Reminders'],
        summary: 'Update a reminder',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'rid', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: jsonBody(ref('UpdateReminderInput')),
        responses: {
          200: { description: 'Reminder updated successfully', content: jsonOf(envelope(ref('Reminder'))) },
          400: validationError,
          401: unauthorized,
          403: forbidden,
          404: notFound,
        },
      },
      delete: {
        tags: ['Reminders'],
        summary: 'Delete a reminder',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'rid', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Reminder deleted successfully', content: jsonOf(envelope()) },
          401: unauthorized,
          403: forbidden,
          404: notFound,
        },
      },
    },

    '/health': {
      get: {
        tags: [],
        summary: 'Health check',
        description: 'Unauthenticated liveness probe used by hosting platforms (e.g. Render).',
        servers: [{ url: '/' }],
        responses: {
          200: {
            description: 'OK',
            content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', example: 'ok' } } } } },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Firebase ID token, e.g. `Authorization: Bearer <token>`',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          firebaseUid: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Pet: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          owner: { type: 'string', description: 'Firebase UID of the owner' },
          name: { type: 'string' },
          species: { type: 'string', enum: SPECIES },
          breed: { type: 'string' },
          weight: { type: 'number' },
          dob: { type: 'string', format: 'date' },
          shareToken: { type: 'string', description: 'Opaque token used in public /share/:token links' },
          photoUrl: { type: 'string', format: 'uri' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CreatePetInput: {
        type: 'object',
        required: ['name', 'species'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          species: { type: 'string', enum: SPECIES },
          breed: { type: 'string', maxLength: 100 },
          weight: { type: 'number', exclusiveMinimum: 0 },
          dob: { type: 'string', format: 'date' },
          photoUrl: { type: 'string', format: 'uri' },
        },
      },
      UpdatePetInput: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          species: { type: 'string', enum: SPECIES },
          breed: { type: 'string', maxLength: 100 },
          weight: { type: 'number', exclusiveMinimum: 0 },
          dob: { type: 'string', format: 'date' },
          photoUrl: { type: 'string', format: 'uri' },
        },
      },
      HealthRecord: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          pet: { type: 'string' },
          owner: { type: 'string' },
          type: { type: 'string', enum: RECORD_TYPES },
          title: { type: 'string' },
          date: { type: 'string', format: 'date-time' },
          notes: { type: 'string' },
          weight: { type: 'number' },
          nextDueDate: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      PaginatedHealthRecords: {
        type: 'object',
        properties: {
          records: { type: 'array', items: ref('HealthRecord') },
          total: { type: 'integer' },
          page: { type: 'integer' },
          pages: { type: 'integer' },
        },
      },
      CreateHealthRecordInput: {
        type: 'object',
        required: ['type', 'title', 'date'],
        properties: {
          type: { type: 'string', enum: RECORD_TYPES },
          title: { type: 'string', minLength: 1, maxLength: 200 },
          date: { type: 'string', format: 'date-time' },
          notes: { type: 'string', maxLength: 2000 },
          weight: { type: 'number', exclusiveMinimum: 0 },
          nextDueDate: { type: 'string', format: 'date-time' },
        },
      },
      UpdateHealthRecordInput: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: RECORD_TYPES },
          title: { type: 'string', minLength: 1, maxLength: 200 },
          date: { type: 'string', format: 'date-time' },
          notes: { type: 'string', maxLength: 2000 },
          weight: { type: 'number', exclusiveMinimum: 0 },
          nextDueDate: { type: 'string', format: 'date-time' },
        },
      },
      Reminder: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          pet: { type: 'string' },
          owner: { type: 'string' },
          title: { type: 'string' },
          dueDate: { type: 'string', format: 'date-time' },
          isDone: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateReminderInput: {
        type: 'object',
        required: ['title', 'dueDate'],
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 200 },
          dueDate: { type: 'string', format: 'date-time' },
        },
      },
      UpdateReminderInput: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 200 },
          dueDate: { type: 'string', format: 'date-time' },
          isDone: { type: 'boolean' },
        },
      },
      SymptomCheckInput: {
        type: 'object',
        required: ['symptoms'],
        properties: {
          symptoms: {
            type: 'string',
            minLength: 10,
            maxLength: 1000,
            example: 'Not eating since yesterday, seems lethargic and is hiding more than usual.',
          },
        },
      },
      SymptomCheckResult: {
        type: 'object',
        properties: {
          causes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                likelihood: { type: 'string', enum: ['high', 'medium', 'low'] },
                homeCare: { type: 'string' },
              },
            },
          },
          urgency: { type: 'string', enum: ['can_wait', 'within_48h', 'go_now'] },
          disclaimer: { type: 'string' },
        },
      },
    },
  },
};

export default openapiSpec;
