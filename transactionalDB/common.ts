export interface Transaction {
  id: number  // canonical int ID maintained by server. Can be null on client if offline
  uid: number  // The user that the transaction belongs to
  timestamp: number  // ms since epoch
  database: string  // the name of the database to which the payload belongs
  operation: "create" | "update" | "delete"

  // In the database, `payload` is flattened, but the response is an object
  payload: {
    // id and key not needed if operation is "create"
    id?: number  // The name of the property to change
    key?: string  // The name of the property to change. Represent nested properties with `.` like "car.wheel[0]" // TODO see my daydream implementation
    value: any
  }
}

export interface DatabaseSchema extends Transaction {
  payloadId?: number;
  payloadKey?: string;
  payloadValue: string;
}
