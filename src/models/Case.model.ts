
import mongoose, { Schema, Document } from 'mongoose';

export const caseTypes = ['civil', 'criminal', 'commercial', 'family', 'administrative', 'labor'];
export const caseStatuses = ['open', 'closed', 'pending', 'appealed'];

export interface ICase extends Document {
  _id: mongoose.Types.ObjectId;
  caseNumber: string;
  title: string;
  description?: string;
  caseType: typeof caseTypes[number];
  status: typeof caseStatuses[number];
  court?: string;
  clients: mongoose.Types.ObjectId[];
  assignedLawyers: mongoose.Types.ObjectId[];
  openingDate: Date;
  closingDate?: Date;
  opponents?: { name: string; lawyer?: string }[];
  timeline?: { date: Date; description: string; createdBy: mongoose.Types.ObjectId }[];
  criticalDates?: { date: Date; description: string; type: string }[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CaseSchema: Schema<ICase> = new Schema(
  {
    caseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    caseType: {
      type: String,
      enum: caseTypes,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: caseStatuses,
      default: 'open',
      index: true,
    },
    court: {
      type: String,
      trim: true,
    },
    clients: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Client',
        required: true,
        index: true,
      },
    ],
    assignedLawyers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
      },
    ],
    openingDate: {
      type: Date,
      default: Date.now,
    },
    closingDate: {
      type: Date,
    },
    opponents: [
      {
        name: { type: String, required: true },
        lawyer: { type: String },
      },
    ],
    timeline: [
      {
        date: { type: Date, required: true },
        description: { type: String, required: true },
        createdBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
      },
    ],
    criticalDates: [
        {
            date: { type: Date, required: true },
            description: { type: String, required: true },
            type: { type: String, required: true }, // e.g., 'Appeal Deadline', 'Filing Deadline'
        }
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const Case = mongoose.model<ICase>('Case', CaseSchema);

export default Case;
