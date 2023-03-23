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

function createTask(task: Task) {
  client.makeCommit({operation: "create", database: "posts", payloadValue: JSON.stringify(task)})
}

async function getAllTasks(task: Task) {
  return (await postsDb).transaction("timer").objectStore("timer")
    .getAll();
}
