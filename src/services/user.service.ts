
import User, { IUser } from '../models/User.model';
import Role from '../models/Role.model';
import { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';

export const findUser = async (query: FilterQuery<IUser>) => {
  return await User.findOne(query);
};

export const findUserById = async (id: string) => {
  return await User.findById(id).populate('role');
};

export const createUser = async (input: Partial<IUser>) => {
    // Find the 'user' role or a default role
    const userRole = await Role.findOne({ name: 'user' });
    if (!userRole) {
      // Handle case where default role is not found, maybe throw an error
      // or assign a different default role. For now, we'll not assign a role.
      // Consider creating a default 'user' role in your seed script.
      console.error("Default 'user' role not found.");
      // Depending on your application's logic, you might want to throw an error
      // throw new Error("Default 'user' role not found.");
    }
  
    // Assign the role if found
    if (userRole) {
      input.role = userRole._id;
    }
  
    return await User.create(input);
  };
  

export const updateUser = async (
  query: FilterQuery<IUser>,
  update: UpdateQuery<IUser>,
  options: QueryOptions
) => {
  return await User.findOneAndUpdate(query, update, options);
};

export const deleteUser = async (query: FilterQuery<IUser>) => {
  return await User.deleteOne(query);
};

export const getAllUsers = async () => {
    return await User.find().populate('role');
  };
  
