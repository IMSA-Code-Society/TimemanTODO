import * as client from "../transactionalDB/client"
import type {TypedDatabase} from "../transactionalDB/indexedDB";

export interface TimerTransaction {
  id: number,
  startTime: number,
  endTime: number,
  taskId: number,
}

export interface Task {
  id: number,
  due: Date,
  title: string,
  description: string,
  predictedTime: number,
  projectId: number,
}

const postsDb = client.openDb("posts", 1) as Promise<TypedDatabase<{ timer: Task & {id: number} }>>;

// TODO: wraps db modifications in a Svelte store
function statefulDbAccessor() {

}

// TODO: export const taskManager = new TaskManager();  // TaskManager contains stateful functions like createTask & getAllTasks

export function createTask(task: Task) {
  client.makeCommit({operation: "create", database: "posts", payloadValue: JSON.stringify(task)})
}

export async function getAllTasks(): Promise<(Task & {id: number})[]> {
  try {
    return (await postsDb).transaction("timer").objectStore("timer")
      .getAll().result;
  } catch (err) {
    // Errored because the db does not exist yet. TODO: more eloquent way of handling this
    return [];
  }
}
