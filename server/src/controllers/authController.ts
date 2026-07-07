import * as authService from '../services/authService.ts';
import handleAsyncError from '../utils/handleAsyncError.ts';

export const getMe = handleAsyncError(async (req, res) => {
  const user = await authService.syncUser(req.user);
  res.json({ success: true, data: user });
});
