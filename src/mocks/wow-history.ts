import type { History } from '../api/types';
import aeloria from '../../contracts/v1/fixtures/populated/char-aeloria.json' with { type: 'json' };
import korren from '../../contracts/v1/fixtures/populated/char-korren.json' with { type: 'json' };
import thalren from '../../contracts/v1/fixtures/populated/char-thalren.json' with { type: 'json' };
import vaelis from '../../contracts/v1/fixtures/populated/char-vaelis.json' with { type: 'json' };

// These pinned response fixtures are validated against the OpenAPI contract.
export const wowHistories = [aeloria, korren, thalren, vaelis] as History[];
