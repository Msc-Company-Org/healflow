import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const incidents = sqliteTable("incidents", {
  id: text("id").primaryKey(),
  repository: text("repository").notNull(),
  branch: text("branch").notNull(),
  commitSha: text("commit_sha").notNull(),
  workflowName: text("workflow_name").notNull(),
  runId: text("run_id").notNull(),
  status: text("status", {
    enum: ["analyzing", "healed", "failed", "requires_human"],
  })
    .default("analyzing")
    .notNull(),
  errorMessage: text("error_message").notNull(),
  rootCauseAnalysis: text("root_cause_analysis"),
  suggestedPatch: text("suggested_patch"),
  prUrl: text("pr_url"),
  timeSavedSeconds: integer("time_saved_seconds").default(900).notNull(), // default 15 min
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const bobSessions = sqliteTable("bob_sessions", {
  id: text("id").primaryKey(),
  incidentId: text("incident_id")
    .notNull()
    .references(() => incidents.id),
  taskType: text("task_type").notNull(), // "root_cause" | "patch_generation"
  promptSummary: text("prompt_summary").notNull(),
  responseSummary: text("response_summary").notNull(),
  filesInspected: text("files_inspected").notNull(), // JSON string array
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Incident = typeof incidents.$inferSelect;
export type NewIncident = typeof incidents.$inferInsert;
export type BobSession = typeof bobSessions.$inferSelect;
export type NewBobSession = typeof bobSessions.$inferInsert;
