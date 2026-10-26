import { describe, expect, it } from 'vitest';
import { pageList } from './Pagination';

describe('pageList', () => {
  it('shows every page when there are few', () => {
    expect(pageList(1, 3)).toEqual([1, 2, 3]);
  });

  it('collapses distant pages into gaps around the current page', () => {
    expect(pageList(6, 12)).toEqual([1, 'gap', 5, 6, 7, 'gap', 12]);
    expect(pageList(1, 12)).toEqual([1, 2, 'gap', 12]);
    expect(pageList(12, 12)).toEqual([1, 'gap', 11, 12]);
  });
});
