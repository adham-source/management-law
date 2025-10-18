import mongoose, { Schema, Document } from 'mongoose';

export const taskStatuses = ['pending', 'in_progress', 'completed', 'on_hold'];
export const taskPriorities = ['low', 'medium', 'high', 'urgent'];
export const taskCategories = ['administrative', 'research', 'documentation', 'client_meeting', 'court_appearance'];

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  assignedTo: mongoose.Types.ObjectId;
  relatedCase?: mongoose.Types.ObjectId;
  relatedClient?: mongoose.Types.ObjectId;
  dueDate?: Date;
  status: typeof taskStatuses[number];
  priority: typeof taskPriorities[number];
  category: typeof taskCategories[number];
  hoursSpent: number;
  cost: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema<ITask> = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    relatedCase: { type: Schema.Types.ObjectId, ref: 'Case' },
    relatedClient: { type: Schema.Types.ObjectId, ref: 'Client' },
    dueDate: { type: Date },
    status: { type: String, enum: taskStatuses, default: 'pending' },
    priority: { type: String, enum: taskPriorities, default: 'medium' },
    category: { type: String, enum: taskCategories, required: true },
    hoursSpent: { type: Number, default: 0 },
    cost: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const Task = mongoose.model<ITask>('Task', TaskSchema);

export default Task;