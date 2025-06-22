import * as dynamodb from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { TranslateResult } from "@translator/shared-types";

export class TranslationTable {
  tableName: string;
  partitionKey: string;
  sortKey: string;
  dynamodbClient: dynamodb.DynamoDBClient;
  constructor({
    tableName,
    partitionKey,
    sortKey,
  }: {
    tableName: string;
    partitionKey: string;
    sortKey: string;
  }) {
    this.tableName = tableName;
    this.partitionKey = partitionKey;
    this.sortKey = sortKey;
    this.dynamodbClient = new dynamodb.DynamoDBClient({});
  }

  // Insert translation
  async insert(data: TranslateResult) {
    // Prepare PutItemCommand input
    const tableInsertCommand: dynamodb.PutItemCommandInput = {
      TableName: this.tableName,
      Item: marshall(data), // marshall converts the original data into a format that is suitable to be stored into DynamoDB
    };

    // Execute Put Item Command Input
    await this.dynamodbClient.send(
      new dynamodb.PutItemCommand(tableInsertCommand)
    );
  }

  // Method to query translations based on the partition key (username)
  async query({ username }: { username: string }) {
    // QueryCommand input
    const queryCommand: dynamodb.QueryCommandInput = {
      TableName: this.tableName,
      KeyConditionExpression: "#PARTITION_KEY = :username", // defines key-value condition for the partition key
      ExpressionAttributeNames: {
        "#PARTITION_KEY": "username", // Maps the placeholder '#PARTITION_KEY' to the actual attribute name 'username'
      },
      ExpressionAttributeValues: {
        ":username": { S: username }, // Maps the placeholder ':username' to the provided username value
      },
      ScanIndexForward: true, // Orders the query results by the sort key in ascending order (true for A-Z, 0-9)
    };

    // Execute Query Command
    const { Items } = await this.dynamodbClient.send(
      new dynamodb.QueryCommand(queryCommand)
    );

    if (!Items) {
      return [];
    }

    const rtnData = Items.map((item) => unmarshall(item) as TranslateResult);

    return rtnData;
  }

  // Delete a translation item based on username and requestId
  async delete({
    username,
    requestId,
  }: {
    username: string;
    requestId: string;
  }) {
    // Prepare input for DynamoDB DeleteItemCommand
    const deleteCommand: dynamodb.DeleteItemCommandInput = {
      TableName: this.tableName,
      Key: {
        [this.partitionKey]: { S: username },
        [this.sortKey]: { S: requestId },
      },
    };

    // Execute the DeleteItemCommand to remove the item from the table
    await this.dynamodbClient.send(
      new dynamodb.DeleteItemCommand(deleteCommand)
    );
    // After deletion, query for remaining items for the given username and return the result
    return this.query({ username });
  }

  // Get all translations
  async getAll() {
    // Scan Command Input
    const scanCommand: dynamodb.ScanCommandInput = {
      TableName: this.tableName,
    };

    // Execute Scan Command Input
    // This variable is of type dynamo.ScanCommandOutput. The property needed from is 'Items'.
    const { Items } = await this.dynamodbClient.send(
      new dynamodb.ScanCommand(scanCommand)
    );

    if (!Items) {
      return [];
    }

    const rtnData = Items.map((item) => unmarshall(item) as TranslateResult);

    return rtnData;
  }
}
