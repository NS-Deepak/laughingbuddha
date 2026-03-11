ALTER TABLE "schedules"
ADD COLUMN IF NOT EXISTS "target_time_utc" TEXT;

CREATE INDEX IF NOT EXISTS "schedules_target_time_utc_idx"
ON "schedules"("target_time_utc");
