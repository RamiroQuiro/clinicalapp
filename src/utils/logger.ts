/**
 * Logger utility to control console output based on environment.
 * Logs are only displayed when running in development mode (import.meta.env.DEV).
 */

const isDev = import.meta.env.DEV;

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug' | 'table';

const noop = () => { };

export const logger = {
    log: isDev ? console.log.bind(console) : noop,
    info: isDev ? console.info.bind(console) : noop,
    warn: isDev ? console.warn.bind(console) : noop,
    error: isDev ? console.error.bind(console) : noop,
    debug: isDev ? console.debug.bind(console) : noop,
    table: isDev ? console.table.bind(console) : noop,

    /**
     * Force log output regardless of environment.
     * Use sparingly for critical production errors.
     */
    force: console.log.bind(console),
};

export default logger;
