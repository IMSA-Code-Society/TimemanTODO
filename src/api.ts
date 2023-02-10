import * as client from "../transactionalDB/client"

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

function createTask(task: Task) {
  client.pushLocalChanges([{operation: "create", timestamp: new Date().getTime(), database: "posts", payloadValue: JSON.stringify(task)}])
}
