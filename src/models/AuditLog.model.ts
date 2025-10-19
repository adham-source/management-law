
import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;       // Who performed the action
  action: string;                    // e.g., 'CREATE_CASE', 'UPDATE_CLIENT'
  targetResource?: string;           // e.g., 'Case', 'Client'
  targetResourceId?: mongoose.Types.ObjectId;
  details?: object;                   // Additional details, like the changes made
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AuditLogSchema: Schema<IAuditLog> = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, required: true, index: true },
    targetResource: { type: String },
    targetResourceId: { type: Schema.Types.ObjectId, index: true },
    details: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
  },
  { timestamps: true }
);

const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export default AuditLog;
