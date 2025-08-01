/**
 * Debug utilities for Cortex app
 */

export function logNavigation(viewName: string, success: boolean, error?: Error) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Navigation to "${viewName}": ${success ? 'SUCCESS' : 'FAILED'}`);
  if (error) {
    console.error('Navigation error:', error);
  }
}

export function logDataOperation(operation: string, type: string, count?: number) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${operation} ${type}${count !== undefined ? `: ${count} items` : ''}`);
}

export function logComponentRender(componentName: string, props?: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[RENDER] ${componentName}`, props ? { ...props } : '');
  }
}

export function validateViewComponent(viewName: string, component: any) {
  if (!component) {
    console.error(`View component "${viewName}" is undefined or null`);
    return false;
  }
  return true;
}