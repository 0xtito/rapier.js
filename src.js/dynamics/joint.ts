import {Rotation, Vector} from "../math";
import {RawJointParams, RawJointSet, RawRigidBodySet} from "../rapier";

export enum JointType {
    Ball,
    Revolute,
}

export class Joint {
    private RAPIER: any;
    private rawSet: RawJointSet; // The Joint won't need to free this.
    readonly handle: number;

    constructor(RAPIER: any, rawSet: RawJointSet, handle: number) {
        this.RAPIER = RAPIER;
        this.rawSet = rawSet;
        this.handle = handle;
    }

    /// The unique integer identifier of the first rigid-body this joint it attached to.
    public jointBodyHandle1(handle: number): number {
        return this.rawSet.jointBodyHandle1(handle);
    }

    /// The unique integer identifier of the second rigid-body this joint is attached to.
    public jointBodyHandle2(handle: number): number {
        return this.rawSet.jointBodyHandle2(handle);
    }

    /// The type of this joint given as a string.
    public jointType(handle: number): string {
        return this.rawSet.jointType(handle);
    }

    /// The rotation quaternion that aligns this joint's first local axis to the `x` axis.
    // #if DIM3
    public jointFrameX1(handle: number): Rotation {
        return Rotation.fromRaw(this.rawSet.jointFrameX1(handle));
    }

    // #endif

    /// The rotation matrix that aligns this joint's second local axis to the `x` axis.
    // #if DIM3
    public jointFrameX2(handle: number): Rotation {
        return Rotation.fromRaw(this.rawSet.jointFrameX2(handle));
    }

    // #endif

    /// The position of the first anchor of this joint.
    ///
    /// The first anchor gives the position of the points application point on the
    /// local frame of the first rigid-body it is attached to.
    public jointAnchor1(handle: number): Vector {
        return Vector.fromRaw(this.rawSet.jointAnchor1(handle));
    }

    /// The position of the second anchor of this joint.
    ///
    /// The second anchor gives the position of the points application point on the
    /// local frame of the second rigid-body it is attached to.
    public jointAnchor2(handle: number): Vector {
        return Vector.fromRaw(this.rawSet.jointAnchor2(handle));
    }

    /// The first axis of this joint, if any.
    ///
    /// For joints where an application axis makes sence (e.g. the revolute and prismatic joins),
    /// this returns the application axis on the first rigid-body this joint is attached to, expressed
    /// in the local-space of this first rigid-body.
    public jointAxis1(handle: number): Vector {
        return Vector.fromRaw(this.rawSet.jointAxis1(handle));
    }

    /// The second axis of this joint, if any.
    ///
    /// For joints where an application axis makes sence (e.g. the revolute and prismatic joins),
    /// this returns the application axis on the second rigid-body this joint is attached to, expressed
    /// in the local-space of this second rigid-body.
    public jointAxis2(handle: number): Vector {
        return Vector.fromRaw(this.rawSet.jointAxis2(handle))
    }
}

export class JointParams {
    anchor1: Vector
    anchor2: Vector
    axis1: Vector
    axis2: Vector
    jointType: JointType

    private constructor() {
    }

    /// Create a new joint descriptor that builds Ball joints.
    ///
    /// A ball joints allows three relative rotational degrees of freedom
    /// by preventing any relative translation between the anchors of the
    /// two attached rigid-bodies.
    public static ball(anchor1: Vector, anchor2: Vector): JointParams {
        let res = new JointParams();
        res.anchor1 = anchor1;
        res.anchor2 = anchor2;
        res.jointType = JointType.Ball;
        return res;
    }

    /// Create a new joint descriptor that builds Revolute joints.
    ///
    /// A revolute joint removes all degrees of degrees of freedom between the affected
    /// bodies except for the translation along one axis.
    // #if DIM3
    public static revolute(
        anchor1: Vector,
        axis1: Vector,
        anchor2: Vector,
        axis2: Vector,
    ): JointParams {
        let res = new JointParams();
        res.anchor1 = anchor1;
        res.anchor2 = anchor2;
        res.axis1 = axis1;
        res.axis2 = axis2;
        res.jointType = JointType.Revolute;
        return res;
    }

    // #endif

    public intoRaw(RAPIER: any): RawJointParams {
        switch (this.jointType) {
            case JointType.Ball:
                return RAPIER.RawJointParams.ball(this.anchor1, this.anchor2);
            // #if DIM3
            case JointType.Revolute:
                return RAPIER.RawJointParams.revolute(this.anchor1, this.axis1, this.anchor2, this.axis2);
            // #endif
        }
    }
}