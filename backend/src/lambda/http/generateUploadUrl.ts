import 'source-map-support/register'
import { S3Helper } from '../../helpers/s3Helper';
import { ApiResponseHelper } from '../../helpers/apiResponseHelper';
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { TodosAccess } from '../../dataLayer/todosAccess'
import { getUserId} from '../../helpers/authHelper'
import { createLogger } from '../../utils/logger'

const todosAccess = new TodosAccess()
const apiResponseHelper = new ApiResponseHelper()

const logger = createLogger('todos')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
  const authHeader = event.headers['Authorization']
  const userId = getUserId(authHeader)

  const item = await todosAccess.getTodoById(todoId)
  if(item.Count == 0){
      logger.error(`The user ${userId} requested to put a url for non-existing todo. ID: ${todoId}`)
      return apiResponseHelper.generateErrorResponse(400,'ToDo does not exist!')
  }

  if(item.Items[0].userId !== userId){
      logger.error(`The user ${userId} requested to put url from a different user account. ID: ${todoId}`)
      return apiResponseHelper.generateErrorResponse(400,'ToDo does not belong to authorized user')
  }
  
  const url = new S3Helper().getPresignedUrl(todoId)
  return apiResponseHelper
          .generateDataSuccessResponse(200,"uploadUrl",url)



}
