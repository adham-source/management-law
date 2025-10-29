import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import { caseTypes, caseStatuses } from '../models/Case.model';
import { taskStatuses, taskPriorities, taskCategories } from '../models/Task.model';
import { appointmentStatuses } from '../models/Appointment.model';
import { invoiceStatuses, invoiceSourceTypes } from '../models/Invoice.model';

const formatEnum = (arr: readonly string[], prefix: string) => {
  return arr.map(value => ({
    value,
    translationKey: `${prefix}${value.replace(/-/g, '_')}`,
  }));
};

export const getEnums = asyncHandler(async (req: Request, res: Response) => {
  const enums = {
    caseTypes: formatEnum(caseTypes, 'enums:case_type_'),
    caseStatuses: formatEnum(caseStatuses, 'enums:case_status_'),
    taskStatuses: formatEnum(taskStatuses, 'enums:task_status_'),
    taskPriorities: formatEnum(taskPriorities, 'enums:task_priority_'),
    taskCategories: formatEnum(taskCategories, 'enums:task_category_'),
    appointmentStatuses: formatEnum(appointmentStatuses, 'enums:appointment_status_'),
    invoiceStatuses: formatEnum(invoiceStatuses, 'enums:invoice_status_'),
    invoiceSourceTypes: formatEnum(invoiceSourceTypes, 'enums:invoice_source_type_'),
  };

  res.status(200).json(enums);
});
