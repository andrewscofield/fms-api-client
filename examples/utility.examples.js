'use strict';

const { log } = require('./services');
const { recordId, fieldData } = require('../index.js');

//#recordid-utility-example
const extractRecordId = client =>
  client
    .find('Heroes', { name: 'yoda' })
    .then(response => recordId(response.data))
    .then(result => log('recordid-utility-example', result));
//#

//#fielddata-utility-example
const extractFieldData = client =>
  client
    .find('Heroes', { name: 'yoda' })
    .then(response => fieldData(response.data))
    .then(result => log('fielddata-utility-example', result));
//#

const utilities = client =>
  Promise.all([extractFieldData(client), extractRecordId(client)]).then(
    responses => client
  );

module.exports = { utilities };