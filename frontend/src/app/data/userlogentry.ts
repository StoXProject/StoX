import './../enum/enums';

import { UserLogType } from './../enum/enums';

// User log entry to keep track of type and content of a log entry.
export class UserLogEntry {
  type: UserLogType;
  log: string;

  constructor(type: UserLogType, log: string) {
    this.type = type;
    this.log = log;
  }
}
