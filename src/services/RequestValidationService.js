const _ = require('lodash');
const logger = require('tc-core-library-js/lib/middleware/logger');
const errors = require('../common/errors');
const utils = require('../common/utils');
const Joi = require('joi');

let validRequestTypes = ['extension'];

function validateRequestType(requestType) {
    let index = _.indexOf(validRequestTypes, requestType);
    if (index >= 0) {
        return requestType;
    }
    return '';
}

function validateRequest(requestType, authUser, record) {
    if (!authUser) {
        throw new errors.BadRequestError("Current User is not available");
    }
    if (!requestType) {
        throw new errors.BadRequestError('Request Type is not valid');
    }
    if (!record.name) {
        throw new errors.BadRequestError('Request Name is required');
    }
    if (requestType.toLowerCase() == "extension") {
        validateExtension(record);
    }
}

validateExtension.schema = {
    extension: Joi.object().keys({
        common: Joi.object().keys({
            submission: Joi.boolean(),
            registration: Joi.boolean(),
            date: Joi.date()
        }),
        name: Joi.string().required().max(255),
        details: Joi.string().max(10000),
    })
}
function validateExtension(extension) {
    return true;
}

module.exports = {
    validateRequestType,
    validateRequest
}