export interface Transaction {
  timestamp: number  // ms since epoch, serves as id
  database: string  // the name of the database to which the payload belongs
  operation: "create" | "update" | "delete" | "increment"  // inspired by https://docs.microsoft.com/en-us/azure/cosmos-db/partial-document-update

  // id and key not needed if operation is "create"
  payloadId?: number;  // The id of the property to change
  payloadValue: string;
}

// Type of `Transaction` stored in the database
export interface ServerTransaction extends Transaction {
  id: number  // canonical int ID maintained by server
  uid: number  // The user that the transaction belongs to
}

export interface WSResponse {
  statusCode: number
  error?: string
  message?: any
}