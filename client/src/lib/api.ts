import type {hwTypeVocab} from "../routes/home/tasks/categorize";
import PouchDB from 'pouchdb-browser';
import DeltaPouch from 'delta-pouch';
import AsSvelteStore from "../db/asSvelteStore";
import PouchFind from "pouchdb-find";
import PouchFindLive from "pouchdb-live-find";
PouchDB.plugin(DeltaPouch);
PouchDB.plugin(PouchFind);
PouchDB.plugin(PouchFindLive);
PouchDB.plugin(AsSvelteStore);

export interface DbDoc {
  // You should probably use `$id` instead, it is computed for delta db
  // _id: string,
  $id: string,
  $createdAt: string,
}

export interface TimerState extends DbDoc {
  table: Table.TIMER,
  startTime: number,
  taskId?: number,
}

export interface Accomplishment {
  accomplishment: string,
  productive: boolean,
}

// Represents a task before it's been committed to the database
export interface Task {
  due: Date,
  title: string,
  description: string,
  predictedTime: number,
  projectId: number,
  category: typeof hwTypeVocab[number],
}

// Represents a task after it's been committed to the database
export type SavedTask = Task & DbDoc & {table: Table.TASK};

export type DbResource<Payload> = DbDoc & Payload;

// BEWARE of changing this if
export enum Table {
  PROJECT,
  TIMER,
  TASK,
}

export interface Project extends DbDoc {
  table: Table.PROJECT,
  name: string,
  owner: number,
  isShared: boolean,
}


// Add properties as necessary
// export interface SharedProject extends Project {}

export type Pouch = SavedTask | Project | TimerState;

export const db = new PouchDB<Pouch>("timeman");
//export const dbIndexReady = db.createIndex();
