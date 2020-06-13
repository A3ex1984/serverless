import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)

  // TODO: Implement creating a new TODO item
  const authHeader = event.headers['Authorization']
  const userId = getUserId(authHeader)
  logger.info(`create group for user ${userId} with data ${newTodo}`)
  const item = await new TodosAccess().createTodo(newTodo,userId)
  return new ApiResponseHelper().generateDataSuccessResponse(201,'item',item)
}
