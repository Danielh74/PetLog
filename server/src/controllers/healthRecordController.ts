import * as healthRecordService from '../services/healthRecordService.ts';
import handleAsyncError from '../utils/handleAsyncError.ts';

export const getRecords = handleAsyncError(async (req, res) => {
  const page = Number(req.query['page']) || 1;
  const limit = Number(req.query['limit']) || 10;
  const result = await healthRecordService.getRecordsByPet(
    req.params['id'] as string,
    req.user.uid,
    page,
    limit,
  );
  res.json({ success: true, ...result });
});

export const createRecord = handleAsyncError(async (req, res) => {
  const record = await healthRecordService.createRecord(
    req.params['id'] as string,
    req.user.uid,
    req.body,
  );
  res.status(201).json({ success: true, data: record });
});

export const updateRecord = handleAsyncError(async (req, res) => {
  const record = await healthRecordService.updateRecord(
    req.params['id'] as string,
    req.params['rid'] as string,
    req.user.uid,
    req.body,
  );
  res.json({ success: true, data: record });
});

export const deleteRecord = handleAsyncError(async (req, res) => {
  await healthRecordService.deleteRecord(
    req.params['id'] as string,
    req.params['rid'] as string,
    req.user.uid,
  );
  res.json({ success: true, message: 'Record deleted' });
});
