
import mongoose, { Schema, Document } from 'mongoose';

export interface IPermission extends Document {
  _id: mongoose.Types.ObjectId;
  name: string; // e.g., 'case:create', 'client:view_all'
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PermissionSchema: Schema<IPermission> = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const Permission = mongoose.model<IPermission>('Permission', PermissionSchema);

export default Permission;
