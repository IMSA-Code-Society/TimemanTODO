import * as client from "../transactionalDB/client"
import type {TypedDatabase} from "../transactionalDB/indexedDB";
import type {hwTypeVocab} from "./tasks/categorize";

export interface TimerTransaction {
  id: number,
  startTime: number,
  endTime: number,
  taskId: number,
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
export interface SavedTask extends Task {
  id: number,
}

const tasksDb = client.openDb("posts", 1) as Promise<TypedDatabase<{ posts: SavedTask }>>;

// TODO: wraps db modifications in a Svelte store
function statefulDbAccessor() {

}

// TODO: export const taskManager = new TaskManager();  // TaskManager contains stateful functions like createTask & getAllTasks

export function createTask(task: Task) {
  client.makeCommit({
    operation: "create",
    database: "posts",
    payloadValue: JSON.stringify({...task, id: new Date().getTime()}),
  });
}

export async function getAllTasks(): Promise<SavedTask[]> {
  // TODO: abstract the promise & request.onsuccess (probably with statefulDbAccessor)
  return new Promise(async res => {
    try {
      const request = (await tasksDb).transaction("posts").objectStore("posts").getAll();
      request.onsuccess = () => res(request.result);
    } catch (err) {
      // Errored because the db does not exist yet. TODO: more elegant way of handling this
      console.error(err);
      res([]);
    }
  });
}
