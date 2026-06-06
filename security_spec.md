# Qyronix Firebase Security Specification (Fortress Rules spec)

This specification details the Attribute-Based Access Control (ABAC) invariants and the hardened firestore security rule properties designed for the Qyronix Core Identity engine.

## 1. Data Invariants
1. **Immutable User Identity**: A user record can only be created with a `uid` matching the active authenticated user's ID (`request.auth.uid`). Once created, the `uid` is immutable.
2. **Temporal Integrity**: The `createdAt` timestamp must match the exact server-received time of creation (`request.time`) and cannot be updated afterwards.
3. **Role Lock**: The `role` field must be chosen from the set `['Candidate', 'Recruiter', 'Admin']`. A user's role can be defined at creation, but is locked and immutable for updates client-side to prevent self-privilege escalation.
4. **ID Poisoning Immunity**: All document access is isolated strictly under document paths where the identifier matches the user's authenticated ID. All keys must be defined exactly, with zero shadow fields.

---

## 2. The "Dirty Dozen" Vulnerable Payloads (Test Assertions)

The following payload attempts represent malicious client operations designed to bypass identity, role immutability, or schema safety, all of which are rejected (`PERMISSION_DENIED`) by the security rules:

1. **Self-Created Identity Spoofing**: Attempt to create a user document under another user's UID.
2. **Role Escalation on Update**: Attempt to change a user's role from "Candidate" to "Admin" via an status edit.
3. **Shadow Update / Inject Ghost Field**: Attempt to inject an unvalidated telemetry key `isPremium: true` onto the User entity.
4. **ID Poisoning Injection**: Attempt to write a profile document where the ID is an excessively large or malformed string (e.g. 500 characters of junk to cause massive index storage utilization).
5. **Client-Controlled Create Timestamp**: Attempt to set `createdAt` in the future or past on account creation instead of using the server-side timestamp value.
6. **Temporal Tampering on Update**: Attempt to modify the `createdAt` timestamp post-creation.
7. **Identity Theft on Resource Mutation**: Attempting to alter the user profile `email` of another user.
8. **PII Scraping Hunt**: Attempting to perform list queries across the user collection without being signed in.
9. **Invalid Role Assign**: Attempting to register a user with an undefined role like `SuperUser`.
10. **Shadow Key Omission**: Trying to create a user document with the `role` field omitted entirely with intent to bypass check conditions.
11. **Excessive String Payload**: Trying to set the user display `name` to a 20KB random string to exhaust Firestore bandwidth during read operations.
12. **Anonymous / Unverified Writes**: Trying to create or change profiles before confirming verification, or when completely unsigned in.

---

## 3. The Rules Blueprint

These payload constraints have been mapped to the production `firestore.rules` implemented in the next step.
