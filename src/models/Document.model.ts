
import mongoose, { Schema, Document } from 'mongoose';

export interface IDocument extends Document {
  _id: mongoose.Types.ObjectId;
  originalName: string;
  description?: string;
  fileName: string;
  filePath: string;
  mimetype: string;
  size: number;
  relatedCase?: mongoose.Types.ObjectId;
  relatedClient?: mongoose.Types.ObjectId;
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema: Schema<IDocument> = new Schema(
  {
    originalName: { type: String, required: true },
    description: { type: String },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    relatedCase: {
      type: Schema.Types.ObjectId,
      ref: 'Case',
    },
    relatedClient: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const DocumentModel = mongoose.model<IDocument>('Document', DocumentSchema);

export default DocumentModel;
