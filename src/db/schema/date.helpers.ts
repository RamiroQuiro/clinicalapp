import { sql } from "drizzle-orm";
import { integer, text } from "drizzle-orm/sqlite-core";

// columns.helpers.ts
const timestamps = {
    updated_at: text('updated_at'),
    created_at: text('created_at').notNull().default(sql`(current_timestamp)`),
    deleted_at: text('deleted_at'),
  }
  
  export default timestamps