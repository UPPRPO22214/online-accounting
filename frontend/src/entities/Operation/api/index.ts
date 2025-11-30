import { getLocalStorageItem, saveLocalStorageItem } from '@/shared/api';
import type { Operation } from '../types';

export const getAccountOperations = (accountId: string) => {
  return getLocalStorageItem<Operation[]>(`account-${accountId}-operations`, []);
};

export const getOperation = (operationId: string) => {
  return getLocalStorageItem<Operation | undefined>(
    `operation-${operationId}`,
    undefined,
  );
};

export const createOperation = (accountId: string, operation: Operation) => {
  saveLocalStorageItem<Operation>(`operation-${operation.id}`, operation);
  const operations = getAccountOperations(accountId);
  saveLocalStorageItem<Operation[]>(`account-${accountId}-operations`, [
    ...operations,
    operation,
  ]);
};

export const editOperation = (operation: Operation) => {
  saveLocalStorageItem<Operation>(`operation-${operation.id}`, operation);
};

export const deleteOperation = (operationId: string, accountId: string) => {
  localStorage.removeItem(`operation-${operationId}`);
  const operations = getAccountOperations(accountId);
  saveLocalStorageItem<Operation[]>(
    `account-${accountId}-operations`,
    operations.filter((other) => operationId !== other.id),
  );
};
