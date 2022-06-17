export interface Transaction {
  id: number  // canonical int ID maintained by server. Can be null on client if offline
  uid: number  // The user that the transaction belongs to
  timestamp: number  // ms since epoch
  database: string  // the name of the database to which the payload belongs
  operation: "create" | "update" | "delete"

  // id and key not needed if operation is "create"
  payloadId?: number;  // The name of the property to change
  payloadKey?: string;  // The name of the property to change. Represent nested properties with `.` like "car.wheel[0]" // TODO see my daydream implementation
  payloadValue: string;
}

export interface WSResponse {
  statusCode: number
  error?: string
  message?: any
}