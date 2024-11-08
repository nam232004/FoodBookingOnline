import { IUser } from '@/types/User';
import {
  fetchData,
  postData,
  updateData,
  deleteData,
} from '@/_lib/data-services';

export const getUserProfile = async(): Promise<IUser> => {
  try {
    const response = await fetchData<IUser>(
      `/api/users/profile`
    );
    return response;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw new Error('User profile could not be loaded');
  }
}

/**
 * Get all users with pagination.
 * @param page - Current page number.
 * @param limit - Number of users per page.
 * @returns Promise<{ total: number; users: IUser[] }>
 */
export const getAllUsers = async (
  page: number = 1,
  limit: number = 10
): Promise<{ total: number; users: IUser[] }> => {
  try {
    const response = await fetchData<{ total: number; users: IUser[] }>(
      `/admin/api/users?page=${page}&limit=${limit}`
    );
    console.log(response);
    return response;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Data could not be loaded');
  }
};

/**
 * Create a new user.
 * @param user - User information.
 * @returns Promise<IUser>
 */
export const createUser = async (user: IUser): Promise<IUser> => {
  try {
    const newUser = await postData('/api/users', user);
    return newUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('User could not be created');
  }
};

/**
 * Update a user by ID.
 * @param id - User ID.
 * @param updates - Updated user information.
 * @returns Promise<IUser>
 */
export const updateUser = async (
  id: string,
  updates: Partial<IUser>
): Promise<IUser> => {
  try {
    // Filter out undefined properties from updates
    const filteredUpdates: IUser = {
      ...updates,
      // Ensure you provide default values for required properties if needed
    } as IUser;

    const updatedUser = await updateData<IUser>(
      `/admin/api/users/${id}`,
      filteredUpdates
    );
    return updatedUser;
  } catch (error) {
    console.error(`Error updating user with id ${id}:`, error);
    throw new Error('User could not be updated');
  }
};

/**
 * Delete a user by ID.
 * @param id - User ID.
 * @returns Promise<void>
 */
export const deleteUser = async (id: string): Promise<void> => {
  try {
    await deleteData(`/admin/api/users/${id}`);
    console.log(`User with id ${id} deleted.`);
  } catch (error) {
    console.error(`Error deleting user with id ${id}:`, error);
    throw new Error('User could not be deleted');
  }
};
