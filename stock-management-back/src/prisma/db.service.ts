import { Injectable } from '@nestjs/common';
import { db } from './db.js';

@Injectable()
export class DbService {
  readonly db = db;
}
