
import mongoose, { Schema, Document } from 'mongoose';

export interface IClient extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  nationalId?: string;
  address?: {
    street: string;
    city: string;
    governorate: string;
    zip?: string;
  };
  phoneNumbers: string[];
  email?: string;
  clientType: 'individual' | 'corporate';
  contactPerson?: {
    name: string;
    email?: string;
    phone: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema: Schema<IClient> = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    nationalId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true, // Allows multiple documents to have a null value for this field
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      governorate: { type: String, trim: true },
      zip: { type: String, trim: true },
    },
    phoneNumbers: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    clientType: {
      type: String,
      enum: ['individual', 'corporate'],
      required: true,
    },
    contactPerson: {
      name: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
      phone: { type: String, trim: true },
    },
    emergencyContact: {
      name: { type: String, trim: true },
      relationship: { type: String, trim: true },
      phone: { type: String, trim: true },
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const Client = mongoose.model<IClient>('Client', ClientSchema);

export default Client;
