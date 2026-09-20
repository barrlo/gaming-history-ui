# Pinned API contract

Pinned OpenAPI 3.1.0 contract, version 0.4.0-review. Canonical ownership belongs to gaming-history-api. Fixtures use fictional data; they are not live character information.

SHA256 of openapi.json: `18b4a9cba929c2cef16c0a87180fdae1c114d495afa18138262f2e1abc6e315a`

The contract adds PoE and PoE2 roster, latest-build, snapshot, and asynchronous refresh operations. These definitions describe the approved target API; adding them does not implement the endpoints or UI screens. Existing WoW operations and schemas are unchanged.

- `fixtures/manifest.json` describes the unchanged WoW scenarios from the 0.3.0-review baseline.
- `fixtures/poe-expansion/manifest.json` maps the twenty PoE/PoE2 examples to their response schemas in this contract.
- Refresh examples cover concurrent requests, cooldowns, archived characters, and failed operations. Build examples include partial and archived data.

The candidate passed hosted Swagger validation with zero issues. Generate declarations with `npm run generate:types` and verify they remain reproducible with `npm run check:generated`. The fixture manifest does not install runtime response validation.

Physical build storage remains undecided. These public models do not prescribe DynamoDB or S3 payload storage.
