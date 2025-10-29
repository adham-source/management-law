import mongoose from 'mongoose';
import chalk from 'chalk';
import { env } from '../config/env'; // Import centralized env
import connectDB from '../config/db';
import Permission from '../models/Permission.model';
import Role from '../models/Role.model';
import User from '../models/User.model';

// --- Configuration ---
const permissionsToCreate = [
  // User Management
  { name: 'user:create', description: 'Create new users' },
  { name: 'user:read', description: 'Read user data' },
  { name: 'user:update', description: 'Update user data' },
  { name: 'user:delete', description: 'Delete users' },
  { name: 'user:manage', description: 'Manage users (create, update, delete)' },

  // Role Management
  { name: 'role:create', description: 'Create new roles' },
  { name: 'role:read', description: 'Read role data' },
  { name: 'role:update', description: 'Update role data' },
  { name: 'role:delete', description: 'Delete roles' },

  // Permission Management
  { name: 'permission:read', description: 'Read permission data' },

  // Case Management
  { name: 'case:create', description: 'Create new cases' },
  { name: 'case:read', description: 'Read case data' },
  { name: 'case:update', description: 'Update case data' },
  { name: 'case:delete', description: 'Delete cases' },

  // Client Management
  { name: 'client:create', description: 'Create new clients' },
  { name: 'client:read', description: 'Read client data' },
  { name: 'client:update', description: 'Update client data' },
  { name: 'client:delete', description: 'Delete clients' },

  // Document Management
  { name: 'document:create', description: 'Upload documents' },
  { name: 'document:read', description: 'Read/Download documents' },
  { name: 'document:delete', description: 'Delete documents' },

  // Appointment Management
  { name: 'appointment:create', description: 'Create new appointments' },
  { name: 'appointment:read', description: 'Read appointment data' },
  { name: 'appointment:update', description: 'Update appointment data' },
  { name: 'appointment:delete', description: 'Delete appointments' },

  // Task Management
  { name: 'task:create', description: 'Create new tasks' },
  { name: 'task:read', description: 'Read task data' },
  { name: 'task:update', description: 'Update task data' },
  { name: 'task:delete', description: 'Delete tasks' },

  // Financials
  { name: 'invoice:create', description: 'Create invoices' },
  { name: 'invoice:read', description: 'Read invoices' },
  { name: 'payment:create', description: 'Create payments' },
  { name: 'expense:create', description: 'Create expenses' },
  { name: 'expense:read', description: 'Read expenses' },

  // Audit
  { name: 'audit:read', description: 'Read audit logs' },
];

const rolesToCreate = [
    {
        name: 'admin',
        permissions: '__ALL__' // Special keyword for all permissions
    },
    {
        name: 'lawyer',
        permissions: ['case:read', 'case:update', 'client:read', 'document:read', 'appointment:read', 'task:read'],
    },
    {
        name: 'secretary',
        permissions: ['appointment:create', 'appointment:read', 'appointment:update', 'client:create', 'client:read'],
    },
    {
        name: 'client',
        permissions: ['case:read', 'document:read', 'appointment:read'],
    },
];

const seedDB = async () => {
  try {
    await connectDB();
    console.log(chalk.blue('Database connected for seeding...'));

    // --- 1. Upsert Permissions (Non-destructive) ---
    console.log(chalk.yellow('Upserting permissions...'));
    const permissionPromises = permissionsToCreate.map(p => 
        Permission.findOneAndUpdate(
            { name: p.name }, 
            { $setOnInsert: { description: p.description } }, 
            { upsert: true, new: true }
        )
    );
    const upsertedPermissions = await Promise.all(permissionPromises);
    console.log(chalk.green('Permissions are up to date!'));

    const permissionMap = new Map(upsertedPermissions.map(p => [p.name, p._id]));

    // --- 2. Upsert Roles (Non-destructive) ---
    console.log(chalk.yellow('Upserting roles...'));
    for (const roleData of rolesToCreate) {
        let permissionIds: mongoose.Types.ObjectId[] = [];
        if (roleData.permissions === '__ALL__') {
            permissionIds = [...permissionMap.values()];
        } else if (Array.isArray(roleData.permissions)) {
            permissionIds = roleData.permissions
                .map(name => permissionMap.get(name))
                .filter((id): id is mongoose.Types.ObjectId => id !== undefined);
        }
        
        await Role.findOneAndUpdate(
            { name: roleData.name },
            { $set: { permissions: permissionIds } }, // Use $set to update permissions if role exists
            { upsert: true, new: true }
        );
    }
    console.log(chalk.green('Roles are up to date!'));

    // --- 3. Upsert Admin User (Non-destructive & Secure) ---
    console.log(chalk.yellow('Upserting admin user...'));

    const adminRole = await Role.findOne({ name: 'admin' });
    if (!adminRole) {
        throw new Error(chalk.red('Admin role not found! Seeding cannot continue.'));
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: env.ADMIN_EMAIL });

    if (!existingAdmin) {
        console.log(chalk.blue('Creating new admin user...'));
        const adminUser = new User({
            name: env.ADMIN_NAME,
            email: env.ADMIN_EMAIL,
            password: env.ADMIN_PASSWORD, // This will be hashed by the pre-save hook
            role: adminRole._id,
            isVerified: true,
        });
        await adminUser.save(); // .save() triggers the pre-save hook
        console.log(chalk.green('Admin user created and password hashed successfully!'));
    } else {
        console.log(chalk.green('Admin user already exists. No action taken.'));
    }

    console.log(chalk.bold.bgGreen('\nSEEDING COMPLETE! 🚀'));

  } catch (error) {
    console.error(chalk.red('Error seeding database:'), error);
  } finally {
    await mongoose.disconnect();
    console.log(chalk.blue('Database connection closed.'));
  }
};

seedDB();