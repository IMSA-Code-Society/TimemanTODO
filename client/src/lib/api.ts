import type {hwTypeVocab} from "../routes/home/tasks/categorize";
import PouchDB from 'pouchdb-browser';
import DeltaPouch from 'delta-pouch';
import AsSvelteStore, {type DbStore} from "../db/asSvelteStore";
import PouchFind from "pouchdb-find";
import PouchFindLive from "pouchdb-live-find";
import {derived} from "svelte/store";
PouchDB.plugin(DeltaPouch.default);
PouchDB.plugin(PouchFind);
PouchDB.plugin(PouchFindLive);
PouchDB.plugin(AsSvelteStore);

export interface DbDoc {
  // You should probably use `$id` instead, it is computed for delta db
  // _id: string,
  $id: string,
  // This exists on all objects, but should never be accessed
  // $createdAt: string,
}

export enum TimerAction {
  START,
  PAUSE,
  STOP,
}

export interface TimerTransaction {
  action: TimerAction,
  time: number,
  taskId?: string,
}

export interface Accomplishment {
  accomplishment: string,
  productive: boolean,
}

export interface Task {
  due?: Date,
  title: string,
  description: string,
  predictedTime: number,
  elapsedTime: number,
  projectId?: number,
  category: typeof hwTypeVocab[number],
}

export type DbUpsert<Content> = Partial<DbDoc> & Content;

export interface Project {
  name: string,
  color: string,
  owner: number,
  isShared: boolean,
}

// TODO: declare this in global.d.ts
// Extend prototype with generics according to https://stackoverflow.com/a/52514102
interface CustomPouch<T> extends PouchDB.Database<T> {
  // TODO: single source of truth for this fn type
  asSvelteStore(requestDef?: RequestDef<T>): DbStore<T & DbDoc>,
  save(doc: DbUpsert<T>): void,
}

// TODO: prepend db names with user ID or another UID
const tasksDb = new PouchDB<Task>("tasks") as CustomPouch<Task>;
const projectsDb = new PouchDB<Project>("projects") as CustomPouch<Project>;
const timerDb = new PouchDB<TimerTransaction>("timer") as CustomPouch<TimerTransaction>;

// TODO: export const taskManager = new TaskManager();  // TaskManager contains stateful functions like createTask & getAllTasks
// TODO: or make it a namespace?

// TODO: use this fn for upsert (rename upsertTask)
export function createTask(task: DbUpsert<Task>) {
  tasksDb.save(task);
}

export function createProject(project: Omit<DbUpsert<Project>, "owner" | "isShared">) {
  // TODO: owner
  projectsDb.save({isShared: false, owner: 1, ...project});
}

export function createCourse(course: Omit<DbUpsert<Project>, "owner" | "isShared">) {
  // TODO
  projectsDb.save({isShared: true, owner: 1, ...course});
}

export function getAllTasks() {
  return tasksDb.asSvelteStore();
}

export function getTask(id: string) {
  return derived(tasksDb.asSvelteStore({selector: {$id: id}}), values => values[0] ?? {} as Partial<typeof values[number]>);
}

export function getAllProjects() {
  return projectsDb.asSvelteStore();
}

export function getAllCourses() {
  // TODO
  return getAllProjects();
}

export function getAllCoursesAndProjects() {
  // TODO
  return derived([getAllProjects(), getAllCourses()], ([projects, courses]) => [...projects, ...courses]);
}

export function changeTimerState(transaction: TimerTransaction) {
  timerDb.save(transaction);
}

/// Time since last TimerState.STOP, accounting for pause & resumes
export async function getRunningTime() {
  const docs = Object.values(await timerDb.all()) as TimerTransaction[];

  // Go backwards to find the index of the last TimerAction.STOP
  let startAt = docs.length - 1;
  while (docs[startAt].action !== TimerAction.STOP)
    startAt--;

  let elapsed = 0;
  let prevTimestamp = docs[startAt].time;
  for (let i = startAt + 1; i<docs.length; i++) {
    const doc = docs[i];
    switch (doc.action) {
      case TimerAction.START:
        prevTimestamp = doc.time;
        break;
      case TimerAction.PAUSE:
        elapsed += doc.time - prevTimestamp;
        break;
      case TimerAction.STOP:
        prevTimestamp = doc.time;
        elapsed += doc.time - prevTimestamp;
        break;
    }
  }
  elapsed += new Date().getTime() - prevTimestamp;

  return elapsed / 1000;
}
