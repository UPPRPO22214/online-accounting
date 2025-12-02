import { type StoreApi } from 'zustand';
import { type Draft } from 'immer';

export type Mutator<T> = (m: (d: Draft<T>) => void) => void;

export type Slice<T> = (
  mutate: Mutator<T>,
  set: StoreApi<T>['setState'],
  get: StoreApi<T>['getState'],
  api: StoreApi<T>,
) => T;
