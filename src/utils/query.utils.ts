
import { Request } from 'express';

interface QueryOptions {
  filter: any;
  sort: any;
  limit: number;
  skip: number;
}

/**
 * Builds a Mongoose filter object from query parameters.
 * @param query - The request query object (req.query).
 * @param filterableFields - An array of field names that are allowed to be filtered.
 * @returns A Mongoose filter object.
 */
export const buildFilter = (query: Request['query'], filterableFields: string[]): any => {
  const filter: any = {};
  for (const field of filterableFields) {
    if (query[field]) {
      // Basic exact match filter
      filter[field] = query[field];
    }
    // Add more complex filtering logic here (e.g., $gte, $lte, $regex for partial matches)
    // Example for partial match:
    // if (query[`${field}_contains`]) {
    //   filter[field] = { $regex: query[`${field}_contains`], $options: 'i' };
    // }
  }
  return filter;
};

/**
 * Builds a Mongoose sort object from query parameters.
 * Expects 'sort' query param in format 'field:direction' (e.g., 'name:asc', 'createdAt:desc').
 * @param query - The request query object (req.query).
 * @returns A Mongoose sort object.
 */
export const buildSort = (query: Request['query']): any => {
  if (query.sort && typeof query.sort === 'string') {
    const [field, direction] = query.sort.split(':');
    return { [field]: direction === 'desc' ? -1 : 1 };
  }
  return { createdAt: -1 }; // Default sort
};

/**
 * Builds pagination options from query parameters.
 * Expects 'page' and 'limit' query params.
 * @param query - The request query object (req.query).
 * @returns An object containing limit and skip values.
 */
export const buildPagination = (query: Request['query']): { limit: number; skip: number } => {
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 10;
  const skip = (page - 1) * limit;
  return { limit, skip };
};
