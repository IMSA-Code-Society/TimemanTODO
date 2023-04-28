import type { TypedDatabase } from "transactionalDB/indexedDB";
import type {SavedTask} from "./api";

export default class Database {
  private db: Promise<TypedDatabase<{ posts: SavedTask }>>;

  constructor(dbName: string) {
  }
}
