import { getLocalStorageItem, saveLocalStorageItem } from '@/shared/api';
import type { Operation } from '../types';

export const getAccountOperations = (accountId: string) => {
  return getLocalStorageItem<string[]>(`account-${accountId}-operations`, []);
}

export const getOperation = (operationId: string) => {
  return getLocalStorageItem<Operation | undefined>(`operation-${operationId}`, undefined);
};

export const createOperation = (accountId: string, operation: Operation) => {
  saveLocalStorageItem<Operation>(`operation-${operation.id}`, operation);
  const operations = getAccountOperations(accountId);
  saveLocalStorageItem<string[]>(`account-${accountId}-operations`, [
    ...operations,
    operation.id
  ])
};

// TODO: edit operation

// TODO: delete operation
