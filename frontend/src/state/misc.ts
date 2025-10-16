import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { PersistOptions } from 'zustand/middleware';
import type { Mutator, Slice } from './types';
import { produce, type Immutable } from 'immer';

export const createWrappedStore = <T extends Immutable<unknown>>(
  creator: Slice<T>,
  persistOptions: PersistOptions<T>,
) =>
  create<T>()(
    devtools(
      persist((set, ...rest) => {
        const mutate: Mutator<T> = (mutator) => set(produce<T>(mutator));

        return creator(mutate, set, ...rest);
      }, persistOptions),
    ),
  );
