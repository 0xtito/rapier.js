import {RawJointSet} from "../rapier"
import {RigidBodySet} from "./rigid_body_set";
import {Joint, JointParams} from "./joint";
import {RigidBody} from "./rigid_body";

export class JointSet {
    private RAPIER: any;
    raw: RawJointSet;

    public free() {
        this.raw.free();
    }

    constructor(RAPIER: any) {
        this.RAPIER = RAPIER;
        this.raw = new RAPIER.RawJointSet();
    }

    public createJoint(
        bodies: RigidBodySet,
        desc: JointParams,
        parent1: number,
        parent2: number
    ): number {
        const rawParams = desc.intoRaw(this.RAPIER);
        const result = this.raw.createJoint(bodies.raw, rawParams, parent1, parent2);
        rawParams.free();
        return result;
    }

    public get(handle: number): Joint {
        if (this.raw.isHandleValid(handle)) {
            return new Joint(this.RAPIER, this.raw, handle);
        } else {
            return null;
        }
    }
}
