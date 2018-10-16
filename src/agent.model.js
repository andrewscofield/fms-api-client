'use strict';

const axios = require('axios');
const https = require('https');
const http = require('http');
const uuidv4 = require('uuid/v4');
const { EmbeddedDocument } = require('marpat');
const { interceptRequest, handleResponseError } = require('./utilities');

/**
 * @class Request
 * @classdesc The class used to integrate with the FileMaker server Data API
 */

const instance = axios.create();

instance.interceptors.request.use(interceptRequest);
instance.interceptors.response.use(response => response, handleResponseError);

class Agent extends EmbeddedDocument {
  constructor() {
    super();
    this.schema({
      /**
       * The version of Data API to use.
       * @member Client#version
       * @type String
       */
      global: {
        type: String
      },
      protocol: {
        type: String,
        required: true,
        choices: ['http', 'https']
      },
      agent: {
        type: Object
      },
      timeout: {
        type: Number
      },
      proxy: {
        type: Object
      }
    });
  }

  preInit(data) {
    let { agent, protocol } = data;
    agent ? this.globalize(protocol, agent) : null;
  }

  globalize(protocol, agent) {
    !global.AGENTS ? (global.AGENTS = {}) : null;
    !this.global ? (this.global = uuidv4()) : null;
    this.agent && !global.AGENTS[this.global]
      ? (global.AGENTS[this.global] =
          protocol === 'https'
            ? {
                httpsAgent: new https.Agent(Agent)
              }
            : {
                httpAgent: new http.Agent(Agent)
              })
      : null;
  }

  localize() {
    return global.AGENTS[this.global];
  }

  preSave() {
    this.agent && !this.global
      ? this.globalize(this.protocol, this.agent)
      : null;
  }

  preDelete() {
    global.AGENTS[this.global] ? this.localize().destroy() : null;
  }

  destroy() {
    return super.delete();
  }

  request(data, configuration = {}) {
    return instance(
      Object.assign(
        data,
        this.timeout ? { timeout: this.timeout } : {},
        this.proxy ? { proxy: this.proxy } : {},
        this.agent ? this.localize() : {},
        configuration
      )
    );
  }
}

module.exports = {
  Agent
};
