import { buildTicketPatch } from './ticket-patch';
import { UpdateTicketDto } from './dto/update-ticket.dto';

// Unit tests: pure function, no database or Nest container required.
describe('buildTicketPatch', () => {
  it('returns an empty patch for an empty payload', () => {
    expect(buildTicketPatch({})).toEqual({});
  });

  it('trims the title', () => {
    expect(buildTicketPatch({ title: '  New title  ' })).toEqual({
      title: 'New title',
    });
  });

  it('trims a provided description', () => {
    expect(buildTicketPatch({ description: ' details ' })).toEqual({
      description: 'details',
    });
  });

  it('treats an explicit null description as a clear, not a crash', () => {
    // The TS type says string, but at runtime class-validator's @IsOptional
    // also skips null - this was the case that used to 500 on .trim().
    const dto = { description: null } as unknown as UpdateTicketDto;
    expect(buildTicketPatch(dto)).toEqual({ description: null });
  });

  it('keeps a present-but-blank description as an empty string', () => {
    expect(buildTicketPatch({ description: '   ' })).toEqual({
      description: '',
    });
  });

  it('passes status and priority through unchanged', () => {
    expect(
      buildTicketPatch({ status: 'in_progress', priority: 'high' }),
    ).toEqual({ status: 'in_progress', priority: 'high' });
  });

  it('includes every provided field in one patch', () => {
    expect(buildTicketPatch({ title: ' t ', status: 'closed' })).toEqual({
      title: 't',
      status: 'closed',
    });
  });
});
