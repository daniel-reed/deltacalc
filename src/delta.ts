import * as Diff from './diff'

/**
 * Encode a number to a base64 string
 *
 * @param {number} num
 * @return string
 */
function toB64(num: number): string {
    return Buffer
        .from(''+num)
        .toString('base64')
        .replace(/=/g, '');
}

/**
 * Decode a base64 string to a number
 *
 * @param {string} str
 * @return number
 */
function fromB64(str: string): number {
    return Number(Buffer.from(str, 'base64').toString('utf8'));
}

/**
 * Write a copy command to the delta string
 *
 * @param {number} length
 * @param {number} offset
 * @return string
 */
function dCopy(length: number, offset: number): string {
    return toB64(length) + '@' + toB64(offset);
}

/**
 * Write a literal command to the delta string
 *
 * @param {number} length
 * @param {string} str
 * @return string
 */
function dLiteral(length: number, str: string): string {
    return toB64(length) + ':' + str;
}

export class Delta {
    /**
     * Encodes the differences of two arrays into a delta string. The delta
     * string represents how to modify s1 into s2
     *
     * @param {string[]} s1
     * @param {string[]} s2
     * @return string
     */
    static encode(s1: string[], s2: string[]): string {
        const diffOps = Diff.diff(s1, s2);
        let parts: string[] = [];
        let pos = 0;
        for (let i = 0; i < diffOps.length; i++) {
            const op = diffOps[i];
            const range = Delta.getConsecutive(diffOps, i);
            i += range - 1;
            switch (op.type) {
                case Diff.OpType.Delete:
                    if (pos < op.posOld) {
                        // Write Copy
                        parts.push(dCopy(op.posOld - pos, pos));
                    }
                    // Move pos to end of range
                    pos = op.posOld + range;
                    break;
                case Diff.OpType.Insert:
                    if (pos < op.posOld) {
                        // Write Copy
                        parts.push(dCopy(op.posOld - pos, pos));
                    }
                    // Write Literal
                    parts.push(
                        dLiteral(
                            range,
                            s2.slice(op.posNew, op.posNew + range).join('')
                        )
                    );
                    // Move pos
                    pos = op.posOld;
                    break;
            }
        }
        if (pos < s1.length) {
            // Write Copy
            parts.push(dCopy(s1.length - pos, pos));
        }
        return parts.join();
    }

    /**
     * Applies a delta string to the provided string and returns the result
     *
     * @param {string[]} s1
     * @param {string} delta
     * @return string[]
     */
    static apply (s1: string[], delta: string): string[] {
        let pre = 0;
        let parts = [];
        for (let i = 0; i < delta.length; i++) {
            switch (delta[i]) {
                case '@': {
                    let nextTokenAt = delta.indexOf(',', i + 1);
                    if (nextTokenAt === - 1) {
                        nextTokenAt = delta.length;
                    }
                    let offset = fromB64(delta.slice(i + 1, nextTokenAt));
                    let length = fromB64(delta.slice(pre, i));
                    i = nextTokenAt;
                    pre = i + 1;
                    parts.push(s1.slice(offset, offset + length).join(''));
                    break;
                }
                case ':': {
                    let length = fromB64(delta.slice(pre, i));
                    parts.push(delta.slice(i + 1, i + length + 1));
                    i = i + length + 1;
                    pre = i + 1;
                    break;
                }
            }
        }
        return parts;
    }

    /**
     * Returns the number of consecutive diff operations of the same type
     *
     * @param {Diff.Op[]} diffOps
     * @param {number} start
     * @return number
     */
    static getConsecutive(diffOps: Diff.Op[], start: number): number {
        let end = start + 1;
        const startOp = diffOps[start];
        for (end; end < diffOps.length; end++) {
            const op = diffOps[end];
            if (startOp.type !== op.type) {
                return end - start;
            }
            if (op.type === Diff.OpType.Delete && op.posOld !== startOp.posOld + 1) {
                return end - start;
            }
            if (op.type === Diff.OpType.Insert && op.posOld !== startOp.posOld) {
                return end - start;
            }
        }
        return end - start;
    }
}