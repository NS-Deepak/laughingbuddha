CREATE TABLE "telegram_link_tokens" (
  "token" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "telegram_link_tokens_pkey" PRIMARY KEY ("token")
);

CREATE INDEX "telegram_link_tokens_user_id_idx" ON "telegram_link_tokens"("user_id");
CREATE INDEX "telegram_link_tokens_expires_at_idx" ON "telegram_link_tokens"("expires_at");

ALTER TABLE "telegram_link_tokens"
ADD CONSTRAINT "telegram_link_tokens_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
