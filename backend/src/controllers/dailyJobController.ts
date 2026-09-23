import { Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import * as dailyJobService from '../services/dailyJobService';
import * as pdfReportService from '../services/pdfReportService';
import { AuthenticatedRequest } from '../types';
import { sendSuccess } from '../utils/apiResponse';

export const getByDate = asyncHandler(async (req, res: Response) => {
  const day = await dailyJobService.getDailyView(req.params.date);
  sendSuccess(res, day, 'Daily jobs retrieved');
});

export const finalize = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const day = await dailyJobService.finalizeDay(req.params.date, req.user!.id);
  sendSuccess(res, day, 'Day finalized successfully');
});

export const downloadPdf = asyncHandler(async (req, res: Response) => {
  const date = req.params.date;
  const pdf = await pdfReportService.buildDailyJobsPdf(date);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="daily-jobs-${date}.pdf"`);
  res.setHeader('Content-Length', String(pdf.length));
  res.send(pdf);
});
