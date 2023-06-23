import type { WithId } from 'mongodb';

/**
 * A sort predicate meant to be used with {@link Array.prototype.sort} when
 * ordering items by their `ObjectId`. In the majority of cases, the result
 * should be the same as what MongoDb would return with `{ sort: { _id: 1 }}`).
 */
export function objectIdPseudoSortPredicate(order: 'ascending' | 'descending') {
  return (a: WithId<unknown>, b: WithId<unknown>) => {
    const [first, second] = order === 'ascending' ? [a, b] : [b, a];
    return (
      Number.parseInt(first._id.toString(), 16) -
      Number.parseInt(second._id.toString(), 16)
    );
  };
}
