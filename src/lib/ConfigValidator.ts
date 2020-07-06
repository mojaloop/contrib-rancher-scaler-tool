import Joi from '@hapi/joi'
import RancherScalerConfigType from '../types/RancherScalerConfigType'

const hookTypeSchema = Joi.object({
  hookType: Joi.string().valid('RUN_STARTUP_SCRIPT', 'SLACK_NOTIFICATION', 'SLEEP').required(),
  script: Joi.string().optional(),
  rebootOnEnd: Joi.boolean().optional(),
  contents: Joi.string().optional(),
  timeMs: Joi.number().optional(),
  color: Joi.string().optional(),
}).required()

const nodeTypeSchema = Joi.object({
  nodePoolId: Joi.string().required(),
  nodeTemplateId: Joi.string().required(),
  minQuantity: Joi.number().required(),
  maxQuantity: Joi.number().required(),
  hooks: Joi.object({
    preScaleUp: Joi.array().items(hookTypeSchema).optional(),
    postScaleUp: Joi.array().items(hookTypeSchema).optional(),
    preScaleDown: Joi.array().items(hookTypeSchema).optional(),
    postScaleDown: Joi.array().items(hookTypeSchema).optional(),
    onFailure: Joi.array().items(hookTypeSchema).optional(),
  }).optional()
})

const schema = Joi.object<RancherScalerConfigType>({
  global: Joi.object({
    preScaleUp: Joi.array().items(hookTypeSchema).optional(),
    postScaleUp: Joi.array().items(hookTypeSchema).optional(),
    preScaleDown: Joi.array().items(hookTypeSchema).optional(),
    postScaleDown: Joi.array().items(hookTypeSchema).optional(),
    onFailure: Joi.array().items(hookTypeSchema).optional(),
  }).required(),
  nodes: Joi.array().items(nodeTypeSchema).required(),
})

const configValidator = (input: any): RancherScalerConfigType => {
  const validatorResult = schema.validate(input);
  if (validatorResult.error) {
    throw new Error(validatorResult.error.message)
  }
  return validatorResult.value;
}

export default configValidator;
