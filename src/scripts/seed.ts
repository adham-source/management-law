
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import chalk from 'chalk';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import connectDB from '../config/db';
import Permission from '../models/Permission.model';
import Role from '../models/Role.model';
import User from '../models/User.model';

// --- Configuration ---
const permissionsToCreate = [
  // User Management
  { name: 'user:create', description: 'Create new users' },
  { name: 'user:read', description: 'Read user information' },
  { name: 'user:update', description: 'Update user information' },
  { name: 'user:delete', description: 'Delete users' },
  { name: 'user:manage', description: 'Manage all user operations' },

  // Role Management
  { name: 'role:create', description: 'Create new roles' },
  { name: 'role:read', description: 'Read role information' },
  { name: 'role:update', description: 'Update role information' },
  { name: 'role:delete', description: 'Delete roles' },
  { name: 'role:manage', description: 'Manage all role operations' },

  // Permission Management
  { name: 'permission:read', description: 'Read permission information' },
  { name: 'permission:manage', description: 'Manage all permission operations' },

  // Case Management
  { name: 'case:create', description: 'Create new cases' },
  { name: 'case:read', description: 'Read case information' },
  { name: 'case:update', description: 'Update case information' },
  { name: 'case:delete', description: 'Delete cases' },
  { name: 'case:manage', description: 'Manage all case operations' },

  // Client Management
  { name: 'client:create', description: 'Create new clients' },
  { name: 'client:read', description: 'Read client information' },
  { name: 'client:update', description: 'Update client information' },
  { name: 'client:delete', description: 'Delete clients' },
  { name: 'client:manage', description: 'Manage all client operations' },
  
  // Document Management
  { name: 'document:create', description: 'Create new documents' },
  { name: 'document:read', description: 'Read document information' },
  { name: 'document:update', description: 'Update document information' },
  { name: 'document:delete', description: 'Delete documents' },
  { name: 'document:manage', description: 'Manage all document operations' },

  // Appointment Management
  { name: 'appointment:create', description: 'Create new appointments' },
  { name: 'appointment:read', description: 'Read appointment information' },
  { name: 'appointment:update', description: 'Update appointment information' },
  { name: 'appointment:delete', description: 'Delete appointments' },
  { name: 'appointment:manage', description: 'Manage all appointment operations' },

  // Task Management
  { name: 'task:create', description: 'Create new tasks' },
  { name: 'task:read', description: 'Read task information' },
  { name: 'task:update', description: 'Update task information' },
  { name: 'task:delete', description: 'Delete tasks' },
  { name: 'task:manage', description: 'Manage all task operations' },

  // Financial Management
  { name: 'expense:create', description: 'Create expenses' },
  { name: 'expense:read', description: 'Read expenses' },
  { name: 'invoice:create', description: 'Create invoices' },
  { name: 'invoice:read', description: 'Read invoices' },
  { name: 'payment:create', description: 'Create payments' },

  // Audit Management
  { name: 'audit:read', description: 'Read audit logs' },
];

const rolesToCreate = [
    {
        name: 'admin',
        permissions: [], // Will be populated with all permissions
    },
    {
        name: 'lawyer',
        permissions: ['case:read', 'case:update', 'client:read', 'document:read', 'appointment:read', 'task:read'],
    },
    {
        name: 'secretary',
        permissions: ['appointment:manage', 'client:create', 'client:read'],
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

    // --- 1. Seed Permissions ---
    console.log(chalk.yellow('Seeding permissions...'));
    await Permission.deleteMany({});
    const createdPermissions = await Permission.insertMany(permissionsToCreate);
    console.log(chalk.green('Permissions seeded successfully!'));

    const permissionMap = new Map(createdPermissions.map(p => [p.name, p._id]));

    // --- 2. Seed Roles ---
    console.log(chalk.yellow('Seeding roles...'));
    await Role.deleteMany({});
    
    const rolesWithPermissionIds = rolesToCreate.map(role => {
        let permissionIds;
        if (role.name === 'admin') {
            // Admin gets all permissions
            permissionIds = [...permissionMap.values()];
        } else {
            permissionIds = role.permissions.map(name => permissionMap.get(name)).filter(id => id);
        }
        return { name: role.name, permissions: permissionIds };
    });

    const createdRoles = await Role.insertMany(rolesWithPermissionIds);
    console.log(chalk.green('Roles seeded successfully!'));

    const adminRole = createdRoles.find(r => r.name === 'admin');

    // --- 3. Seed Admin User ---
    console.log(chalk.yellow('Seeding admin user...'));
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD || !process.env.ADMIN_NAME) {
        throw new Error(chalk.red('Please provide ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD in your .env file'));
    }

    await User.deleteOne({ email: process.env.ADMIN_EMAIL });

    const adminUser = new User({
        name: process.env.ADMIN_NAME,
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: adminRole?._id,
        isVerified: true, // Admin is verified by default
    });

    await adminUser.save();
    console.log(chalk.green('Admin user seeded successfully!'));

    console.log(chalk.bold.bgGreen('\nSEEDING COMPLETE! 🚀'));

  } catch (error) {
    console.error(chalk.red('Error seeding database:'), error);
  } finally {
    await mongoose.disconnect();
    console.log(chalk.blue('Database connection closed.'));
  }
};

seedDB();
