
import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
  _id: mongoose.Types.ObjectId;
  name: string; // e.g., 'admin', 'lawyer', 'secretary', 'client'
  permissions: mongoose.Types.ObjectId[]; // References to Permission model
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema: Schema<IRole> = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    permissions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Permission',
      },
    ],
  },
  { timestamps: true }
);

const Role = mongoose.model<IRole>('Role', RoleSchema);

export default Role;
