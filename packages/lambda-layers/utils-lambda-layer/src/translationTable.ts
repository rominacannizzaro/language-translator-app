import * as dynamodb from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { TranslateDbObject } from "@translator/shared-types";

export class TranslationTable {
  tableName: string;
  partitionKey: string;
  dynamodbClient: dynamodb.DynamoDBClient;
  constructor({
    tableName,
    partitionKey,
  }: {
    tableName: string;
    partitionKey: string;
  }) {
    this.tableName = tableName;
    this.partitionKey = partitionKey;
    this.dynamodbClient = new dynamodb.DynamoDBClient({});
  }

  // Insert translation
  async insert(data: TranslateDbObject) {
    // Put Item Command Input
    const tableInsertCommand: dynamodb.PutItemCommandInput = {
      TableName: this.tableName,
      Item: marshall(data), // marshall converts the original data into a format that is suitable to be stored into DynamoDB
    };

    // Execute Put Item Command Input
    await this.dynamodbClient.send(
      new dynamodb.PutItemCommand(tableInsertCommand)
    );
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

    const rtnData = Items.map((item) => unmarshall(item) as TranslateDbObject);

    return rtnData;
  }
}
