import * as dynamodb from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { TranslatePrimaryKey, TranslateResult } from "@translator/shared-types";

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

  // Store a new translation record in DynamoDB
  async insert(data: TranslateResult) {
    // Prepare PutItemCommand input
    const tableInsertCommand: dynamodb.PutItemCommandInput = {
      TableName: this.tableName,
      Item: marshall(data), // marshall converts the original data into a format that is suitable to be stored into DynamoDB
    };

    // Send PutItemCommand to DynamoDB to insert the item
    await this.dynamodbClient.send(
      new dynamodb.PutItemCommand(tableInsertCommand)
    );
  }

  // Query all translations for a given username (partition key is username)
  async query({ username }: TranslatePrimaryKey) {
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
      ScanIndexForward: true, // Sorts results by sort key in ascending order
    };

    // Send query request to DynamoDB
    const { Items } = await this.dynamodbClient.send(
      new dynamodb.QueryCommand(queryCommand)
    );

    if (!Items) {
      return [];
    }

    const rtnData = Items.map((item) => unmarshall(item) as TranslateResult);

    return rtnData;
  }

  // Delete a translation by username and requestId, then returns remaining translations for this user
  async delete(item: TranslatePrimaryKey) {
    // Prepare input for DynamoDB DeleteItemCommand
    const deleteCommand: dynamodb.DeleteItemCommandInput = {
      TableName: this.tableName,
      Key: {
        [this.partitionKey]: { S: item.username },
        [this.sortKey]: { S: item.requestId },
      },
    };

    // Execute the DeleteItemCommand to remove the item from the table
    await this.dynamodbClient.send(
      new dynamodb.DeleteItemCommand(deleteCommand)
    );
    // After deletion, query for remaining items for the given username and return the result
    return item;
  }

  // Get all translation records
  async getAll() {
    // Scan Command Input
    const scanCommand: dynamodb.ScanCommandInput = {
      TableName: this.tableName,
    };

    // Execute the scan operation on the DynamoDB table
    const { Items } = await this.dynamodbClient.send(
      new dynamodb.ScanCommand(scanCommand)
    );

    if (!Items) {
      return [];
    }

    // Unmarshall each item to TranslateResult type, then return the array
    const rtnData = Items.map((item) => unmarshall(item) as TranslateResult);

    return rtnData;
  }
}
