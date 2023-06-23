import { isNewAuthEntry } from 'multiverse/next-auth/db';

describe('::isNewAuthEntry', () => {
  it('returns true only if passed a NewAuthEntry', async () => {
    expect.hasAssertions();

    expect(isNewAuthEntry(undefined)).toBeFalse();
    expect(isNewAuthEntry(null)).toBeFalse();
    expect(isNewAuthEntry(1)).toBeFalse();
    expect(isNewAuthEntry('1')).toBeFalse();
    expect(isNewAuthEntry({})).toBeFalse();
    expect(isNewAuthEntry({ attributes: undefined })).toBeFalse();
    expect(isNewAuthEntry({ attributes: null })).toBeFalse();
    expect(isNewAuthEntry({ attributes: { owner: true } })).toBeFalse();
    expect(isNewAuthEntry({ attributes: { owner: null } })).toBeFalse();

    expect(
      isNewAuthEntry({ attributes: { owner: 'owner', isGlobalAdmin: 1 } })
    ).toBeFalse();

    expect(
      isNewAuthEntry({ attributes: { owner: 'owner', isGlobalAdmin: 'true' } })
    ).toBeFalse();

    expect(
      isNewAuthEntry({
        attributes: { owner: 'owner', isGlobalAdmin: false, extra: 'prop' }
      })
    ).toBeFalse();

    expect(
      isNewAuthEntry({ attributes: { owner: 'owner', isGlobalAdmin: false } })
    ).toBeTrue();

    expect(isNewAuthEntry({ attributes: { owner: 'owner' } })).toBeTrue();
  });
});
