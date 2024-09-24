/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

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

  /**
   * Logs a silly message.
   * @param args - The arguments to be logged.
   */
  silly: (...args: any[]) => void;
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
  silly: console.debug,
};

export default logger;
