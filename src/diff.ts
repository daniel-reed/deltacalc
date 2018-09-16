export enum OpType {
    'Insert',
    'Delete',
}

export class Op {
    type: OpType;
    posOld: number;
    posNew: number;

    constructor(type: OpType, posOld: number, posNew: number = 0) {
        this.type = type;
        this.posOld = posOld;
        this.posNew = posNew;
    }
}

export function diff(e: string[], f: string[], i: number = 0, j: number = 0): Op[] {
    let N = e.length;
    let M = f.length;
    let L = M + N;
    let Z = 2 * Math.min(M, N) + 2;
    if (N > 0 && M > 0) {
        let w = N - M;
        let g = Array(Z).fill(0);
        let p = Array(Z).fill(0);
        for (let h = 0; h < (L / 2 + (L % 2 === 0 ? 0 : 1) + 1); h++) {
            for (let r = 0; r < 2; r++) {
                let c, d, o, m;
                if (r == 0) c = g, d = p, o = 1, m = 1;
                else c = p, d = g, o = 0, m = -1;
                for (let k = -1 * (h - 2 * Math.max(0, h-M)); k < (h - 2 * Math.max(0,h-N) + 1); k += 2) {
                    let a = (k == -h || k !== h && c[(k - 1) % Z] < c[(k + 1) % Z]) ? c[(k + 1) % Z] : c[k - 1 % Z] + 1;
                    let b = a - k;
                    let s = a;
                    let t = b;
                    while (a < N && b < M && e[(1-o)*N+m*a+(o-1)] === f[(1-o)*M+m*b+(o-1)]) {
                        a += 1;
                        b += 1;
                    }
                    c[k%Z] = a;
                    let z = -1 * (k - w);
                    if (L%2 === o && z>= -1 * (h - o) && z <= h - o && c[k%Z]+d[z%Z] >= N) {
                        let D, x, y, u, v;
                        if (o == 1) {
                            D = 2 * h - 1;
                            x = s;
                            y = t;
                            u = a;
                            v = b;
                        } else {
                            D = 2 * h;
                            x = N - a;
                            y = M - b;
                            u = N - s;
                            v = M - t;
                        }
                        switch (true) {
                            case D > 1 || (x !== u && y != v):
                                return diff(e.slice(0, x), f.slice(0, y), i, j).concat(diff(e.slice(u, N), f.slice(v, M), i+u, j+v));
                            case M > N:
                                return diff([], f.slice(N, M), i+N, j+N);
                            case M < N:
                                return diff(e.slice(M, N), [], i+M, j+M);
                            default:
                                return [];
                        }
                    }
                }
            }
        }
    } else if (N > 0) {
        let result = Array(N);
        for (let n = 0; n < N; n++) {
            result[n] = new Op(OpType.Delete, i + n);
        }
        return result;
    } else {
        let result = Array(M);
        for (let n = 0; n < M; n++) {
            result[n] = new Op(OpType.Insert, i, j + n);
        }
        return result;
    }
}

export function printInstructions(s1: any[], s2: any[]) {
    const diffOps = diff(s1, s2);
    let parts = [];
    for (let i = 0; i < diffOps.length; i++) {
        const op = diffOps[i];
        switch (op.type) {
            case OpType.Delete:
                parts.push(
                    'Delete ' + s1[op.posOld] + ' from s1 at postion ' +
                    op.posOld + ' in s1.\n'
                );
                break;
            case OpType.Insert:
                parts.push(
                    'Insert ' + s2[op.posNew] + ' from s2 before position ' +
                    op.posOld + ' into s1.\n'
                );
                break;
        }
    }
    return parts.join('');
}