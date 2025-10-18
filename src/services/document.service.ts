
import DocumentModel, { IDocument } from '../models/Document.model';
import mongoose from 'mongoose';
import fs from 'fs';
import util from 'util';
import path from 'path';
import { IUser } from '../models/User.model';
import Case from '../models/Case.model';
import { IRole } from '../models/Role.model';

const unlinkFile = util.promisify(fs.unlink);

// Create Document Record Service
export const createDocumentRecord = async (
  file: Express.Multer.File,
  userId: mongoose.Types.ObjectId,
  body: { description?: string; relatedCase?: string; relatedClient?: string; }
): Promise<IDocument> => {
  const documentData = {
    originalName: file.originalname,
    description: body.description,
    fileName: file.filename, // Use filename from multer
    filePath: file.path,
    mimetype: file.mimetype,
    size: file.size,
    uploadedBy: userId,
    ...(body.relatedCase && { relatedCase: new mongoose.Types.ObjectId(body.relatedCase) }),
    ...(body.relatedClient && { relatedClient: new mongoose.Types.ObjectId(body.relatedClient) }),
  };
  return DocumentModel.create(documentData);
};

// Get documents with authorization checks
export const getDocuments = async (query: any, user: IUser, sort: any, limit: number, skip: number): Promise<IDocument[]> => {
    const userRole = user.role as IRole;
    if (userRole.name !== 'admin') {
        // Non-admins can only see documents related to their cases or that they uploaded
        const userCases = await Case.find({ assignedLawyers: user._id }).select('_id');
        const caseIds = userCases.map(c => c._id);
        query.$or = [
            { uploadedBy: user._id },
            { relatedCase: { $in: caseIds } }
        ];
    }
    return DocumentModel.find(query).sort(sort).limit(limit).skip(skip);
};

// Get a single document with authorization
export const findDocumentById = async (documentId: string, user: IUser): Promise<IDocument | null> => {
    const doc = await DocumentModel.findById(documentId);
    if (!doc) return null;

    const userRole = user.role as IRole;
    if (userRole.name === 'admin') {
        return doc;
    }

    // Check if user is assigned to the related case
    if (doc.relatedCase) {
        const caseFile = await Case.findOne({ _id: doc.relatedCase, assignedLawyers: user._id });
        if (caseFile) return doc;
    }

    // Check if user uploaded the document
    if (doc.uploadedBy.equals(user._id)) {
        return doc;
    }

    return null; // Not authorized
};

// Delete a document (file and record)
export const deleteDocument = async (documentId: string, user: IUser): Promise<IDocument | null> => {
    const doc = await findDocumentById(documentId, user);
    if (!doc) return null; // Not found or not authorized

    try {
        await unlinkFile(doc.filePath);
    } catch (err: any) {
        console.error(`Failed to delete file: ${doc.filePath}`, err);
        // Decide if you want to proceed with DB deletion even if file deletion fails
    }

    await doc.deleteOne();
    return doc;
};

// Replace a document's file
export const replaceDocumentFile = async (documentId: string, newFile: Express.Multer.File, user: IUser): Promise<IDocument | null> => {
    const doc = await findDocumentById(documentId, user);
    if (!doc) return null; // Not found or not authorized

    const oldFilePath = doc.filePath;

    // Update document record with new file info
    doc.originalName = newFile.originalname;
    doc.fileName = newFile.filename;
    doc.filePath = newFile.path;
    doc.mimetype = newFile.mimetype;
    doc.size = newFile.size;
    await doc.save();

    // Delete old file from filesystem
    try {
        await unlinkFile(oldFilePath);
    } catch (err: any) {
        console.error(`Failed to delete old file: ${oldFilePath}`, err);
    }

    return doc;
};

// Update document metadata
export const updateDocumentMeta = async (documentId: string, body: { description?: string }, user: IUser): Promise<IDocument | null> => {
    const doc = await findDocumentById(documentId, user);
    if (!doc) return null;

    if (body.description) {
        doc.description = body.description;
    }

    await doc.save();
    return doc;
};
