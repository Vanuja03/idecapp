import PDFDocument from 'pdfkit';
import { DailyJobControl } from '../models/DailyJobControl';
import { Job } from '../models/Job';
import { User } from '../models/User';
import { DayStatus, JobStatus, JobType, VehicleSource } from '../types';
import { AppError } from '../utils/AppError';
import { assertBusinessDate, formatDateTimeInTimezone } from '../utils/dates';

const STATUS_COLORS: Record<JobStatus, string> = {
  PENDING: '#C98900',
  ONGOING: '#0284C7',
  COMPLETED: '#1F7A4D',
  CANCELED: '#B42318',
};

const STATUS_LABELS: Record<JobStatus, string> = {
  PENDING: 'PENDING',
  ONGOING: 'ON GOING',
  COMPLETED: 'COMPLETED',
  CANCELED: 'CANCELED',
};

function formatDisplayDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export async function buildDailyJobsPdf(date: string): Promise<Buffer> {
  assertBusinessDate(date);

  const control = await DailyJobControl.findOne({ date });
  if (!control || control.status !== DayStatus.FINALIZED) {
    throw new AppError(
      'PDF report is available only after this day has been finalized.',
      403,
      'DAY_NOT_FINALIZED',
    );
  }

  const jobs = await Job.find({ jobDate: date }).sort({ createdAt: 1 });

  let finalizedByName = '—';
  if (control.finalizedBy) {
    const user = await User.findById(control.finalizedBy).select('name');
    finalizedByName = user?.name ?? '—';
  }

  const counts = {
    total: jobs.length,
    pending: jobs.filter((job) => job.status === 'PENDING').length,
    ongoing: jobs.filter((job) => job.status === 'ONGOING').length,
    completed: jobs.filter((job) => job.status === 'COMPLETED').length,
    canceled: jobs.filter((job) => job.status === 'CANCELED').length,
  };

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    doc.fillColor('#0F3D6E').fontSize(18).font('Helvetica-Bold').text('IDEC Logistics & Trading', { align: 'left' });
    doc.moveDown(0.2);
    doc.fillColor('#12263A').fontSize(14).text('Daily Jobs Report');
    doc.moveDown(0.4);
    doc.font('Helvetica').fontSize(11).fillColor('#5B6B7C');
    doc.text(`Date: ${formatDisplayDate(date)}`);
    doc.text(`Status: FINALIZED`);
    doc.text(`Finalized by: ${finalizedByName}`);
    doc.text(`Finalized at: ${control.finalizedAt ? formatDateTimeInTimezone(control.finalizedAt) : '—'}`);
    doc.moveDown(0.6);
    doc.fillColor('#12263A').text(
      `Total: ${counts.total}   Pending: ${counts.pending}   On going: ${counts.ongoing}   Completed: ${counts.completed}   Canceled: ${counts.canceled}`,
    );
    doc.moveDown(0.8);

    const CELL_PADDING = 8;
    doc.font('Helvetica-Bold').fontSize(9);
    const statusWidth =
      Math.ceil(Math.max(...Object.values(STATUS_LABELS).map((label) => doc.widthOfString(label)))) +
      CELL_PADDING +
      4;
    const fixedWidths = { no: 24, vehicle: 74, type: 30, status: statusWidth, createdAt: 70, updatedAt: 70, notes: 80 };
    const destinationWidth = pageWidth - Object.values(fixedWidths).reduce((sum, width) => sum + width, 0);

    const columns = [
      { key: 'no', label: '#', width: fixedWidths.no },
      { key: 'vehicle', label: 'Vehicle', width: fixedWidths.vehicle },
      { key: 'type', label: 'Type', width: fixedWidths.type },
      { key: 'destination', label: 'Destination', width: destinationWidth },
      { key: 'status', label: 'Status', width: fixedWidths.status },
      { key: 'createdAt', label: 'Created', width: fixedWidths.createdAt },
      { key: 'updatedAt', label: 'Last updated', width: fixedWidths.updatedAt },
      { key: 'notes', label: 'Notes / Vendor', width: fixedWidths.notes },
    ] as const;

    const drawHeader = (y: number) => {
      doc.rect(doc.page.margins.left, y, pageWidth, 22).fill('#0F3D6E');
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(9);
      let x = doc.page.margins.left + 4;
      for (const column of columns) {
        doc.text(column.label, x, y + 6, { width: column.width - CELL_PADDING, ellipsis: true });
        x += column.width;
      }
      return y + 22;
    };

    let y = drawHeader(doc.y);

    const ensureSpace = (rowHeight: number) => {
      if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
        y = drawHeader(doc.page.margins.top);
      }
    };

    if (jobs.length === 0) {
      ensureSpace(30);
      doc.fillColor('#5B6B7C').font('Helvetica').fontSize(10);
      doc.text('No jobs were recorded for this date.', doc.page.margins.left, y + 10);
    } else {
      jobs.forEach((job, index) => {
        const isOther = job.vehicleSource === VehicleSource.OTHER;
        const note = job.notes?.trim();
        const values = [
          String(index + 1),
          isOther ? `${job.vehicleNumberSnapshot} (Other)` : job.vehicleNumberSnapshot,
          job.jobType ?? JobType.IM,
          job.destination,
          STATUS_LABELS[job.status] ?? job.status,
          formatDateTimeInTimezone(job.createdAt),
          formatDateTimeInTimezone(job.updatedAt),
          note ? (isOther ? `Vendor: ${note}` : note) : '—',
        ];

        const cellFont = (key: (typeof columns)[number]['key']) => (key === 'status' ? 'Helvetica-Bold' : 'Helvetica');

        doc.fontSize(9);
        const heights = columns.map((column, i) =>
          doc.font(cellFont(column.key)).heightOfString(values[i], { width: column.width - CELL_PADDING }),
        );
        const rowHeight = Math.max(22, ...heights) + 10;
        ensureSpace(rowHeight);

        if (index % 2 === 0) {
          doc.rect(doc.page.margins.left, y, pageWidth, rowHeight).fill('#F4F6F9');
        }

        doc.fontSize(9);
        let x = doc.page.margins.left + 4;
        columns.forEach((column, i) => {
          const color = column.key === 'status' ? (STATUS_COLORS[job.status] ?? '#12263A') : '#12263A';
          doc.fillColor(color).font(cellFont(column.key));
          doc.text(values[i], x, y + 5, { width: column.width - CELL_PADDING });
          x += column.width;
        });

        doc
          .strokeColor('#D7DEE7')
          .moveTo(doc.page.margins.left, y + rowHeight)
          .lineTo(doc.page.margins.left + pageWidth, y + rowHeight)
          .stroke();

        y += rowHeight;
      });
    }

    doc.end();
  });
}
