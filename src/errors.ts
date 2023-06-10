abstract class MechanusError extends Error {
    abstract override readonly name: string;
};

export class MechanusStoreError extends MechanusError {
    readonly name = 'MechanusStoreError';
};

export class MechanusComputedRefError extends MechanusError {
    readonly name = 'MechanusComputedRefError';
};