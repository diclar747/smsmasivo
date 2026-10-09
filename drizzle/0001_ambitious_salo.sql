CREATE INDEX `campaigns_user_status_idx` ON `campaigns` (`user_id`,`status`);--> statement-breakpoint
CREATE INDEX `contacts_user_idx` ON `contacts` (`user_id`);--> statement-breakpoint
CREATE INDEX `ledger_user_date_idx` ON `ledger` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `messages_user_date_idx` ON `messages` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `orders_user_date_idx` ON `orders` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `recipients_campaign_status_idx` ON `recipients` (`campaign_id`,`status`);--> statement-breakpoint
CREATE INDEX `sessions_user_idx` ON `sessions` (`user_id`);