# Security Specification - Fast-Books Firebase Firestore Security Rules

## 1. Data Invariants
1. A user cannot read, create, update, or delete any record (invoices, quotes, expenses, clients, bank accounts, transactions, profiles, SARS filings) belonging to another user.
2. Document IDs must be valid alphanumeric/hyphen/underscore strings of maximum 128 characters (`isValidId`).
3. Timestamps and textual properties have strict length limits to prevent denial-of-wallet resource exhaustion.
4. Monetary values (grandTotal, subtotal, taxTotal, balance, amount) must be numbers.
5. All operations default to deny unless explicitly authorized.

## 2. The Dirty Dozen Payloads (Rejection Targets)
1. **Unauthenticated Read**: Attempting to read `/users/{userId}/invoices/{invoiceId}` without `request.auth`. -> `PERMISSION_DENIED`
2. **Cross-User Snooping**: User A authenticated as `uid_A` reading `/users/uid_B/clients/client_1`. -> `PERMISSION_DENIED`
3. **Cross-User Writing**: User A writing `/users/uid_B/invoices/inv_99`. -> `PERMISSION_DENIED`
4. **Oversized Document ID Attack**: Attempting to create a document with a 2KB string ID. -> `PERMISSION_DENIED`
5. **Special Character ID Injection**: Creating doc ID with `../../eval/hack`. -> `PERMISSION_DENIED`
6. **Oversized String Injection**: Storing a 50MB string in `clientName` or `notes`. -> `PERMISSION_DENIED`
7. **Invalid Type for Monetary Amount**: Submitting `{ amount: "FREE_1000" }` for an expense. -> `PERMISSION_DENIED`
8. **Invalid Status Enum**: Submitting `{ status: "hacked_status" }` for an invoice. -> `PERMISSION_DENIED`
9. **Missing Required Fields**: Creating a client without `name` or `email`. -> `PERMISSION_DENIED`
10. **Shadow Field Injection**: Injecting unexpected executable or unauthorized keys into structured documents. -> `PERMISSION_DENIED`
11. **List Query Scraping without Auth**: Querying `/users/{userId}/invoices` without matching `userId`. -> `PERMISSION_DENIED`
12. **Root Collection Unauthorized Access**: Querying or writing directly to non-user paths or catch-all. -> `PERMISSION_DENIED`
