import { AsyncLocalStorage } from "node:async_hooks";
import { Queryable } from "./database.service";

export interface RequestStore {
    tx: Queryable;
    afterCommit: Array<() => void>;
}

export const requestContext = new AsyncLocalStorage<RequestStore>()