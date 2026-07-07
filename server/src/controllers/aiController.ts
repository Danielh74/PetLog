import * as aiService from '../services/aiService.ts';
import handleAsyncError from '../utils/handleAsyncError.ts';

export const symptomCheck = handleAsyncError(async (req, res) => {
  const { petId, symptoms } = req.body as { petId: string; symptoms: string };
  const result = await aiService.checkSymptoms(petId, req.user.uid, symptoms);
  res.json({ success: true, data: result });
});
