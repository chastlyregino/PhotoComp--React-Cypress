/**
 * Entry point for the UserManagement component
 * Re-exports the controller as the default export for easy imports
 */
import UserManagementController from './controller/UserManagementController';

export default UserManagementController;

// Also export model and view for testing or other uses if needed
export * from './model/UserManagementModel';
export * from './model/AccountModel';
export * from './model/OrganizationModel';
export { default as UserManagementView } from './view/UserManagementView';