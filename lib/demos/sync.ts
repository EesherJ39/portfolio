import { CRDT } from './synclab/crdt.ts';
import type { Batch } from './synclab/types';

// Actual repository CRDT; only the in-memory transport is simulated.
export class SyncSession {
  replicas = [new CRDT('a'), new CRDT('b')];
  connected = true;
  queue: { to: number; batch: Batch }[] = [];
  operations = 0;
  constructor() {
    const initial = this.replicas[0].localInsert(0, 'Build together.');
    this.replicas[1].applyBatch(initial);
  }
  deliver(from: number, batch: Batch) {
    this.operations += batch.ops.length;
    if (this.connected) this.replicas[1 - from].applyBatch(batch);
    else this.queue.push({ to: 1 - from, batch });
  }
  append(replica: number, text: string) {
    if (this.operations + Array.from(text).length > 600) return;
    const index = Array.from(this.replicas[replica].getState().text).length;
    this.deliver(replica, this.replicas[replica].localInsert(index, text));
  }
  backspace(replica: number) {
    if (this.operations >= 600) return;
    const length = Array.from(this.replicas[replica].getState().text).length;
    if (length)
      this.deliver(replica, this.replicas[replica].localDelete(length - 1, 1));
  }
  disconnect() {
    this.connected = false;
  }
  reconnect() {
    // Reverse and duplicate every operation to exercise dependency repair.
    for (const message of [...this.queue].reverse()) {
      for (const op of [...message.batch.ops].reverse()) {
        this.replicas[message.to].applyBatch({ v: 1, ops: [op, op] });
      }
    }
    this.queue = [];
    this.connected = true;
  }
  snapshot() {
    return {
      texts: this.replicas.map((replica) => replica.getState().text),
      connected: this.connected,
      pending: this.queue.reduce(
        (sum, message) => sum + message.batch.ops.length,
        0,
      ),
      operations: this.operations,
    };
  }
}
