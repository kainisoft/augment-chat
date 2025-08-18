import { signal, computed, effect, Signal, WritableSignal } from '@angular/core';

/**
 * Signal utility functions for enhanced signal operations
 */

/**
 * Create a signal with local storage persistence
 */
export function createPersistedSignal<T>(
  key: string,
  initialValue: T,
  serializer: {
    serialize: (value: T) => string;
    deserialize: (value: string) => T;
  } = {
    serialize: JSON.stringify,
    deserialize: JSON.parse
  }
): WritableSignal<T> {
  // Try to load from localStorage
  let storedValue = initialValue;
  try {
    const stored = localStorage.getItem(key);
    if (stored !== null) {
      storedValue = serializer.deserialize(stored);
    }
  } catch (error) {
    console.warn(`Failed to load persisted signal "${key}":`, error);
  }

  const persistedSignal = signal(storedValue);

  // Effect to persist changes
  effect(() => {
    try {
      const value = persistedSignal();
      localStorage.setItem(key, serializer.serialize(value));
    } catch (error) {
      console.warn(`Failed to persist signal "${key}":`, error);
    }
  });

  return persistedSignal;
}

/**
 * Create a computed signal that debounces updates
 */
export function createDebouncedComputed<T>(
  computation: () => T,
  delay: number = 300
): Signal<T> {
  const sourceSignal = signal(computation());
  let timeout: number | null = null;

  effect(() => {
    const newValue = computation();
    
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      sourceSignal.set(newValue);
      timeout = null;
    }, delay);
  });

  return sourceSignal.asReadonly();
}

/**
 * Create a signal that automatically resets after a delay
 */
export function createAutoResetSignal<T>(
  initialValue: T,
  resetValue: T,
  resetDelay: number
): WritableSignal<T> & { reset: () => void } {
  const autoResetSignal = signal(initialValue);
  let timeout: number | null = null;

  const originalSet = autoResetSignal.set.bind(autoResetSignal);
  
  (autoResetSignal as any).set = (value: T) => {
    originalSet(value);
    
    if (timeout) {
      clearTimeout(timeout);
    }

    if (value !== resetValue) {
      timeout = setTimeout(() => {
        originalSet(resetValue);
        timeout = null;
      }, resetDelay);
    }
  };

  const reset = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    originalSet(resetValue);
  };

  return Object.assign(autoResetSignal, { reset });
}

/**
 * Create a signal that tracks loading state
 */
export function createLoadingSignal(): {
  loading: Signal<boolean>;
  startLoading: () => void;
  stopLoading: () => void;
  withLoading: <T>(promise: Promise<T>) => Promise<T>;
} {
  const loadingSignal = signal(false);
  let loadingCount = 0;

  const startLoading = () => {
    loadingCount++;
    loadingSignal.set(true);
  };

  const stopLoading = () => {
    loadingCount = Math.max(0, loadingCount - 1);
    if (loadingCount === 0) {
      loadingSignal.set(false);
    }
  };

  const withLoading = async <T>(promise: Promise<T>): Promise<T> => {
    startLoading();
    try {
      return await promise;
    } finally {
      stopLoading();
    }
  };

  return {
    loading: loadingSignal.asReadonly(),
    startLoading,
    stopLoading,
    withLoading
  };
}

/**
 * Create a signal that tracks async operations
 */
export function createAsyncSignal<T, E = Error>(
  initialValue?: T
): {
  value: Signal<T | undefined>;
  loading: Signal<boolean>;
  error: Signal<E | null>;
  execute: (promise: Promise<T>) => Promise<T>;
  reset: () => void;
} {
  const valueSignal = signal<T | undefined>(initialValue);
  const loadingSignal = signal(false);
  const errorSignal = signal<E | null>(null);

  const execute = async (promise: Promise<T>): Promise<T> => {
    loadingSignal.set(true);
    errorSignal.set(null);

    try {
      const result = await promise;
      valueSignal.set(result);
      return result;
    } catch (error) {
      errorSignal.set(error as E);
      throw error;
    } finally {
      loadingSignal.set(false);
    }
  };

  const reset = () => {
    valueSignal.set(initialValue);
    loadingSignal.set(false);
    errorSignal.set(null);
  };

  return {
    value: valueSignal.asReadonly(),
    loading: loadingSignal.asReadonly(),
    error: errorSignal.asReadonly(),
    execute,
    reset
  };
}

/**
 * Create a signal that manages a list with common operations
 */
export function createListSignal<T>(
  initialItems: T[] = [],
  keyFn: (item: T, index: number) => string | number = (_item: T, index: number) => index
): {
  items: Signal<T[]>;
  add: (item: T) => void;
  remove: (key: string | number) => void;
  update: (key: string | number, updates: Partial<T>) => void;
  clear: () => void;
  find: (key: string | number) => T | undefined;
  filter: (predicate: (item: T) => boolean) => T[];
  sort: (compareFn?: (a: T, b: T) => number) => void;
} {
  const itemsSignal = signal([...initialItems]);

  const add = (item: T) => {
    itemsSignal.update(items => [...items, item]);
  };

  const remove = (key: string | number) => {
    itemsSignal.update(items => items.filter((item, index) => keyFn(item, index) !== key));
  };

  const update = (key: string | number, updates: Partial<T>) => {
    itemsSignal.update(items => 
      items.map((item, index) => 
        keyFn(item, index) === key ? { ...item, ...updates } : item
      )
    );
  };

  const clear = () => {
    itemsSignal.set([]);
  };

  const find = (key: string | number): T | undefined => {
    return itemsSignal().find((item, index) => keyFn(item, index) === key);
  };

  const filter = (predicate: (item: T) => boolean): T[] => {
    return itemsSignal().filter(predicate);
  };

  const sort = (compareFn?: (a: T, b: T) => number) => {
    itemsSignal.update(items => [...items].sort(compareFn));
  };

  return {
    items: itemsSignal.asReadonly(),
    add,
    remove,
    update,
    clear,
    find,
    filter,
    sort
  };
}

/**
 * Create a signal that manages form state
 */
export function createFormSignal<T extends Record<string, any>>(
  initialValues: T
): {
  values: Signal<T>;
  errors: Signal<Partial<Record<keyof T, string>>>;
  touched: Signal<Partial<Record<keyof T, boolean>>>;
  isValid: Signal<boolean>;
  isDirty: Signal<boolean>;
  setValue: <K extends keyof T>(key: K, value: T[K]) => void;
  setError: <K extends keyof T>(key: K, error: string | null) => void;
  setTouched: <K extends keyof T>(key: K, touched: boolean) => void;
  reset: () => void;
  validate: (validators: Partial<Record<keyof T, (value: any) => string | null>>) => void;
} {
  const valuesSignal = signal({ ...initialValues });
  const errorsSignal = signal<Partial<Record<keyof T, string>>>({});
  const touchedSignal = signal<Partial<Record<keyof T, boolean>>>({});

  const isValid = computed(() => {
    const errors = errorsSignal();
    return Object.values(errors).every(error => !error);
  });

  const isDirty = computed(() => {
    const current = valuesSignal();
    return Object.keys(current).some(key => 
      current[key as keyof T] !== initialValues[key as keyof T]
    );
  });

  const setValue = <K extends keyof T>(key: K, value: T[K]) => {
    valuesSignal.update(values => ({ ...values, [key]: value }));
  };

  const setError = <K extends keyof T>(key: K, error: string | null) => {
    errorsSignal.update(errors => ({ ...errors, [key]: error }));
  };

  const setTouched = <K extends keyof T>(key: K, touched: boolean) => {
    touchedSignal.update(touchedState => ({ ...touchedState, [key]: touched }));
  };

  const reset = () => {
    valuesSignal.set({ ...initialValues });
    errorsSignal.set({});
    touchedSignal.set({});
  };

  const validate = (validators: Partial<Record<keyof T, (value: any) => string | null>>) => {
    const values = valuesSignal();
    const newErrors: Partial<Record<keyof T, string>> = {};

    Object.keys(validators).forEach(key => {
      const validator = validators[key as keyof T];
      if (validator) {
        const error = validator(values[key as keyof T]);
        if (error) {
          newErrors[key as keyof T] = error;
        }
      }
    });

    errorsSignal.set(newErrors);
  };

  return {
    values: valuesSignal.asReadonly(),
    errors: errorsSignal.asReadonly(),
    touched: touchedSignal.asReadonly(),
    isValid,
    isDirty,
    setValue,
    setError,
    setTouched,
    reset,
    validate
  };
}

/**
 * Create a signal that manages pagination state
 */
export function createPaginationSignal(
  initialPage: number = 1,
  initialPageSize: number = 10
): {
  currentPage: Signal<number>;
  pageSize: Signal<number>;
  totalItems: Signal<number>;
  totalPages: Signal<number>;
  hasNextPage: Signal<boolean>;
  hasPreviousPage: Signal<boolean>;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setTotalItems: (total: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
} {
  const currentPageSignal = signal(initialPage);
  const pageSizeSignal = signal(initialPageSize);
  const totalItemsSignal = signal(0);

  const totalPages = computed(() => 
    Math.ceil(totalItemsSignal() / pageSizeSignal())
  );

  const hasNextPage = computed(() => 
    currentPageSignal() < totalPages()
  );

  const hasPreviousPage = computed(() => 
    currentPageSignal() > 1
  );

  const setPage = (page: number) => {
    const maxPage = totalPages();
    const validPage = Math.max(1, Math.min(page, maxPage));
    currentPageSignal.set(validPage);
  };

  const setPageSize = (size: number) => {
    pageSizeSignal.set(Math.max(1, size));
    // Reset to first page when page size changes
    currentPageSignal.set(1);
  };

  const setTotalItems = (total: number) => {
    totalItemsSignal.set(Math.max(0, total));
    // Ensure current page is still valid
    const maxPage = Math.ceil(total / pageSizeSignal());
    if (currentPageSignal() > maxPage && maxPage > 0) {
      currentPageSignal.set(maxPage);
    }
  };

  const nextPage = () => {
    if (hasNextPage()) {
      currentPageSignal.update(page => page + 1);
    }
  };

  const previousPage = () => {
    if (hasPreviousPage()) {
      currentPageSignal.update(page => page - 1);
    }
  };

  const firstPage = () => {
    currentPageSignal.set(1);
  };

  const lastPage = () => {
    const maxPage = totalPages();
    if (maxPage > 0) {
      currentPageSignal.set(maxPage);
    }
  };

  return {
    currentPage: currentPageSignal.asReadonly(),
    pageSize: pageSizeSignal.asReadonly(),
    totalItems: totalItemsSignal.asReadonly(),
    totalPages,
    hasNextPage,
    hasPreviousPage,
    setPage,
    setPageSize,
    setTotalItems,
    nextPage,
    previousPage,
    firstPage,
    lastPage
  };
}