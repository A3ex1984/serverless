import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { getUserId } from '../../helpers/authHelper'
import { UpdateTodoRequest } from '../../requests/updateTodoRequest'
import { TodosAccess } from '../../dataLayer/todosAccess'
import { ApiResponseHelper } from '../../helpers/apiResponseHelper'
import { createLogger } from '../../utils/logger'

const logger = createLogger('todos')
const todosAccess = new TodosAccess()
const apiResponseHelper = new ApiResponseHelper()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  const authHeader = event.headers['Authorization']
  const userId = getUserId(authHeader)

  const item = await todosAccess.getTodoById(todoId)

  if(item.Count == 0){
      logger.error(`The user ${userId} is requesting an update for a non-existing ToDo. ID: ${todoId}`)
      return apiResponseHelper.generateErrorResponse(400,'ToDo does not exist')
  } 

  if(item.Items[0].userId !== userId){
      logger.error(`The user ${userId} is requesting update to ToDo without authorization. ID: ${todoId}`)
      return apiResponseHelper.generateErrorResponse(400,'ToDo does not belong to authorized user')
  }

  logger.info(`The user ${userId} is updating group ${todoId} to be ${updatedTodo}`)
  await new TodosAccess().updateTodo(updatedTodo,todoId)
  return apiResponseHelper.generateEmptySuccessResponse(204)



}
