import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import * as documentService from '../services/document.service';
import { buildFilter, buildSort, buildPagination } from '../utils/query.utils';
import path from 'path';

export const uploadDocument = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Not authorized' });
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const document = await documentService.createDocumentRecord(req.file, req.user._id, req.body);
  res.status(201).json(document);
});

export const getDocuments = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    const filter = buildFilter(req.query, ['originalName', 'mimetype']);
    const sort = buildSort(req.query);
    const { limit, skip } = buildPagination(req.query);
    const documents = await documentService.getDocuments({ ...filter }, req.user, sort, limit, skip);
    res.status(200).json(documents);
});

export const downloadDocument = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    const { id } = req.params;
    const doc = await documentService.findDocumentById(id, req.user);

    if (!doc) {
        return res.status(404).json({ message: 'Document not found or you do not have permission to access it' });
    }

    const filePath = path.resolve(doc.filePath);
    res.download(filePath, doc.originalName, (err) => {
        if (err) {
            console.error("File download error:", err);
            if (!res.headersSent) {
                res.status(500).json({ message: 'Error downloading the file.' });
            }
        }
    });
});

export const replaceDocument = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const { id } = req.params;

    const document = await documentService.replaceDocumentFile(id, req.file, req.user);
    if (!document) {
        return res.status(404).json({ message: 'Document not found or you do not have permission to modify it' });
    }
    res.status(200).json(document);
});

export const updateDocumentMeta = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    const { id } = req.params;
    const document = await documentService.updateDocumentMeta(id, req.body, req.user);
    if (!document) {
        return res.status(404).json({ message: 'Document not found or you do not have permission to modify it' });
    }
    res.status(200).json(document);
});

export const deleteDocument = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Not authorized' });
  const { id } = req.params;
  const document = await documentService.deleteDocument(id, req.user);
  if (!document) {
    return res.status(404).json({ message: 'Document not found or you do not have permission to delete it' });
  }
  res.status(200).json({ message: 'Document deleted successfully' });
});