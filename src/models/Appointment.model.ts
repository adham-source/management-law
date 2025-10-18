
import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  attendees: mongoose.Types.ObjectId[];
  relatedCase?: mongoose.Types.ObjectId;
  location?: string;
  status: 'scheduled' | 'completed' | 'canceled' | 'rescheduled';
  googleEventId?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema: Schema<IAppointment> = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    attendees: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    relatedCase: {
      type: Schema.Types.ObjectId,
      ref: 'Case',
    },
    location: {
      type: String,
      trim: true,
    },
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'canceled', 'rescheduled'],
        default: 'scheduled',
    },
    googleEventId: {
        type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const Appointment = mongoose.model<IAppointment>('Appointment', AppointmentSchema);

export default Appointment;
