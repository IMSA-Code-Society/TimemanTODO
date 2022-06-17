// Makes only K optional
// Adapted from https://stackoverflow.com/a/61108377
type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export interface TypedDatabase<Stores extends Record<string, CustomSchema>> extends IDBDatabase {
    // T[number] converts the array into a literal string union
    transaction<T extends (keyof Stores)[] | keyof Stores, Mode extends IDBTransactionMode="readonly">(storeNames: T extends (keyof Stores)[] ? readonly [...T] : T, mode?: Mode): TypedTransaction<Pick<Stores, T extends (keyof Stores)[] ? T[number]: T>, Mode>
    createObjectStore<T extends keyof Stores>(name: T, options?: IDBObjectStoreParameters): CustomStore<Stores[T]>;
}

// "tests"
// let foo: TypedDatabase<{ "transactions": { id: number, uid: number }, "junk": {id: number, yeet: string} }>
// foo.transaction("transactions", "readonly").objectStore("transactions").add({uid: 5}, "sdfghj")

interface TypedTransaction<Stores extends Record<string, CustomSchema>, Mode extends IDBTransactionMode> extends IDBTransaction {
    objectStore<T extends keyof Stores>(name: T): Mode extends "readonly" ? ReadonlyCustomStore<Stores[T]> : CustomStore<Stores[T]>;
}

interface CustomSchema {
    id: any;
}

interface ReadonlyCustomStore<Schema extends CustomSchema> extends IDBObjectStore {
    add(value: never, key?: IDBValidKey): IDBRequest<IDBValidKey>;
    put(value: never, key?: IDBValidKey): IDBRequest<IDBValidKey>;
    delete(query: never): IDBRequest<undefined>;
    // Unfortunately, there is no way that I know to block the clear() method, so I hope I'm not stupid enough to do that
    //openCursor(query?: keyof Schema | IDBKeyRange | null, direction?: IDBCursorDirection): IDBRequest<IDBCursorWithValue | null>;
    get(query: IDBValidKey | IDBKeyRange): IDBRequest<Schema>;
    getAll(query?: IDBValidKey | IDBKeyRange | null, count?: number): IDBRequest<Schema[]>;
}

interface CustomStore<Schema extends CustomSchema> extends ReadonlyCustomStore<Schema> {
    add(value: Optional<Schema, 'id'>, key?: IDBValidKey): IDBRequest<IDBValidKey>;
    put(value: Partial<Schema>, key?: IDBValidKey): IDBRequest<IDBValidKey>;
    delete(query: IDBValidKey | IDBKeyRange): IDBRequest<undefined>;
}
