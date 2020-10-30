const _ = require('lodash');
const errors = require('../common/errors');
const cacheService = require('./CacheService');
const utils  = require('../common/utils'); 
const { connect } = require('../models');

const validProperties = {
    "id":"id",
    "directProjectId":"directProjectId",
    "name":"name",
    "status":"status",
    "createdBy":"createdBy",
    "details":"details",
    "description":"description",
    "createdDate":"createdDate",
    "createdAt":"createdAt"
};

function validateConnect(connectProject) {

    let keys = _.keys(connectProject);
    
    // Add validation that utm should be topgear
    // And created by should be topgear user
    _.forEach(keys, function(key, value) {
       if(!validProperties[key]) {
           delete connectProject[key];
       }    
    });
    return connectProject;
}

module.exports = {
    validateConnect
}