const winston = require('winston');
// const DatadogTransport = require('winston-datadog');
const DatadogTransport = require('@shelf/winston-datadog-logs-transport');
const { loadConfig } = require('../functions');

const logger = ((service='undefined-service', config) => {

    const level = config?.level || 'debug';

    const _l = winston.createLogger({
        level,
        format: winston.format.json(),
        defaultMeta: { service },
        transports: [
            new winston.transports.Console({
                format: winston.format.simple(),
                colorize: true
            }),
            new winston.transports.File({
                filename: `logs/${service}_debug.log`,
                level: 'debug'
            }),
            new winston.transports.File({
                filename: `logs/${service}_info.log`,
                level: 'info'
            }),
            new winston.transports.File({
                filename: `logs/${service}_error.log`,
                level: 'error'
            })
        ]
    });


    if (config.datadog && config.datadog.apiKey){
        _l.add(
            new DatadogTransport({
                apiKey: config.datadog.apiKey,
                metadata: {
                    ddsource: service,
                    environment: config.environment
                }
            })
        );
    }


    // To make compatible with fastify logger
    // _l.log = () => {_l.info(arguments[0])};
    _l.fatal = () => {_l.error(arguments[0])};
    _l.trace = () => {_l.silly(arguments[0])};

    return _l;
});

module.exports = logger;
