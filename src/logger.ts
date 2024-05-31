/* eslint "@typescript-eslint/no-explicit-any": "off", "no-console": "off" */

// simple logger based on console

/**
 * Represents a logger object with different log levels.
 */
export interface Logger {
  /**
   * Logs a debug message.
   * @param args - The arguments to be logged.
   */
  debug: (...args: any[]) => void;

  /**
   * Logs an info message.
   * @param args - The arguments to be logged.
   */
  info: (...args: any[]) => void;

  /**
   * Logs a warning message.
   * @param args - The arguments to be logged.
   */
  warn: (...args: any[]) => void;

  /**
   * Logs an error message.
   * @param args - The arguments to be logged.
   */
  error: (...args: any[]) => void;
}

/**
 * The logger object provides logging functionality for debugging,
 * information, warnings, and errors.
 */
const logger: Logger = {
  debug: console.debug,
  info: console.info,
  warn: console.warn,
  error: console.error,
};

export default logger;
