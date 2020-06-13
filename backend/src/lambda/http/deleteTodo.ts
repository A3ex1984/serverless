import 'source-map-support/register'
import { getUserId} from '../../helpers/authHelper'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { TodosAccess } from '../../dataLayer/todosAccess'
import { ApiResponseHelper } from '../../helpers/apiResponseHelper'

const apiResponseHelper = new ApiResponseHelper()

const todosAccess = new TodosAccess()
const logger = createLogger('todos')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  // TODO: Remove a TODO item by id
  if(!todoId){
    logger.error('ToDo ID needed!')
    return apiResponseHelper.generateErrorResponse(400,'invalid parameters')
  }

  const authHeader = event.headers['Authorization']
  const userId = getUserId(authHeader)

  const item = await todosAccess.getTodoById(todoId)
  if(item.Count == 0){
    logger.error(`The user ${userId} is requesting to delete a non-existing ToDo. ID: ${todoId}`)
    return apiResponseHelper.generateErrorResponse(400,'ToDo does not exist')
}


if(item.Items[0].userId !== userId){
    logger.error(`The user ${userId} is requesting to delete a ToDo he is not authorized for. ID: ${todoId}`)
    return apiResponseHelper.generateErrorResponse(400,'ToDo does not belong to authorized user')
}

logger.info(`User ${userId} deleting todo ${todoId}`)
await todosAccess.deleteTodoById(todoId)
return apiResponseHelper.generateEmptySuccessResponse(204)




}
