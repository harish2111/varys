import {
  AuthScheme,
  ContractKind,
  type DocumentationContract,
  ElementType,
  type ExtractedUnit,
  FindingCategory,
  Severity,
} from '@varys/contracts';
import type { RawLlmFinding } from '@varys/llm-client';
import { backVerify, backVerifyFinding } from '../src/back-verify';

const unit: ExtractedUnit = {
  key: 'create_contact',
  id: 'create_contact',
  name: 'Create Contact',
  elementType: ElementType.ACTION,
  contractKind: ContractKind.REST,
  inputFields: [{ name: 'email', type: 'string', required: true }],
  outputFields: [],
  httpCalls: [
    { method: 'POST', pathTemplate: '/contacts', queryParams: [], headerNames: [], authScheme: AuthScheme.BEARER, hasBody: true },
  ],
  graphqlOps: [],
  astHash: 'x',
};

const contract: DocumentationContract = {
  kind: ContractKind.REST,
  vendor: 'hubspot',
  apiVersion: 'v3',
  resourceGroup: 'contacts',
  title: 'Create Contact',
  method: 'POST',
  path: '/contacts',
  requestFields: [
    { name: 'email', type: 'string', required: true },
    { name: 'firstname', type: 'string', required: false },
  ],
};

describe('backVerifyFinding', () => {
  it('admits a finding whose target field is traceable, clamped to the LLM band + HITL', () => {
    const raw: RawLlmFinding = {
      finding_type: 'SCHEMA_MISMATCH',
      severity: 'WARNING',
      target_field: 'firstname',
      explanation: 'firstname is documented but missing',
      confidence_score: 0.95,
    };
    const f = backVerifyFinding(raw, unit, contract)!;
    expect(f).not.toBeNull();
    expect(f.source).toBe('llm');
    expect(f.category).toBe(FindingCategory.SCHEMA);
    expect(f.confidence).toBeLessThanOrEqual(0.8); // clamped to LLM-inferred band
    expect(f.hitl).toBe(true);
  });

  it('discards a hallucinated finding whose target field is untraceable', () => {
    const raw: RawLlmFinding = {
      finding_type: 'SCHEMA_MISMATCH',
      severity: 'CRITICAL',
      target_field: 'totally_made_up_field',
      explanation: 'invented',
      confidence_score: 0.9,
    };
    expect(backVerifyFinding(raw, unit, contract)).toBeNull();
  });

  it('admits a finding with no target field (general observation)', () => {
    const raw: RawLlmFinding = {
      finding_type: 'AUTH_MISMATCH',
      severity: 'CRITICAL',
      explanation: 'auth header format differs',
      confidence_score: 0.8,
    };
    const f = backVerifyFinding(raw, unit, contract)!;
    expect(f.category).toBe(FindingCategory.AUTH);
    expect(f.severity).toBe(Severity.CRITICAL);
  });
});

describe('backVerify (batch)', () => {
  it('counts discarded hallucinations', () => {
    const { admitted, discarded } = backVerify(
      [
        { finding_type: 'SCHEMA_MISMATCH', severity: 'WARNING', target_field: 'email', explanation: 'x', confidence_score: 0.8 },
        { finding_type: 'SCHEMA_MISMATCH', severity: 'WARNING', target_field: 'ghost', explanation: 'y', confidence_score: 0.8 },
      ],
      unit,
      contract,
    );
    expect(admitted).toHaveLength(1);
    expect(discarded).toBe(1);
  });
});
