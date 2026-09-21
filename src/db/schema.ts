import { pgTable, text, serial, integer, numeric, boolean, timestamp, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').unique(),
  role: text('role').notNull(),
  branch: text('branch').notNull(),
  status: text('status').default('ACTIVE'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const accounts = pgTable('accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: text('code').notNull().unique(),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en').notNull(),
  category: text('category').notNull(),
  nature: text('nature').notNull(),
  level: integer('level').notNull(),
  parentId: text('parent_id'),
  isHeader: boolean('is_header').default(false),
  currency: text('currency').notNull(),
  currentBalance: numeric('current_balance', { precision: 20, scale: 4 }).default('0'),
});

export const journalEntries = pgTable('journal_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  entryNumber: text('entry_number').notNull().unique(),
  date: text('date').notNull(),
  period: text('period').notNull(),
  type: text('type').notNull(),
  description: text('description').notNull(),
  status: text('status').notNull(),
  currency: text('currency').notNull(),
  totalDebit: numeric('total_debit', { precision: 20, scale: 4 }).default('0'),
  totalCredit: numeric('total_credit', { precision: 20, scale: 4 }).default('0'),
  createdBy: text('created_by'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const journalLines = pgTable('journal_lines', {
  id: uuid('id').defaultRandom().primaryKey(),
  journalEntryId: uuid('journal_entry_id').references(() => journalEntries.id).notNull(),
  accountId: uuid('account_id').references(() => accounts.id).notNull(),
  debit: numeric('debit', { precision: 20, scale: 4 }).default('0'),
  credit: numeric('credit', { precision: 20, scale: 4 }).default('0'),
  currency: text('currency').notNull(),
  exchangeRate: numeric('exchange_rate', { precision: 10, scale: 6 }).default('1'),
  memo: text('memo'),
});

export const systemState = pgTable('system_state', {
  id: text('id').primaryKey(),
  data: text('data').notNull(), // Using text to store JSON string to ensure compatibility across drizzle versions
  updatedAt: timestamp('updated_at').defaultNow(),
});
export const journalEntriesRelations = relations(journalEntries, ({ many }) => ({
  lines: many(journalLines),
}));

export const journalLinesRelations = relations(journalLines, ({ one }) => ({
  entry: one(journalEntries, {
    fields: [journalLines.journalEntryId],
    references: [journalEntries.id],
  }),
  account: one(accounts, {
    fields: [journalLines.accountId],
    references: [accounts.id],
  }),
}));
