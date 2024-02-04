import type RAPIER from "@dimforge/rapier3d";
import type {Testbed} from "../Testbed";

type RAPIER_API = typeof import("@dimforge/rapier3d");

function createSpringJoints(
    RAPIER: RAPIER_API,
    world: RAPIER.World,
    origin: RAPIER.Vector3,
    num: number,
) {
    let radius = 0.5;
    let mass = 1;

    let groundDesc = RAPIER.RigidBodyDesc.fixed();
    let groundRigidBody = world.createRigidBody(groundDesc);

    let stiffness = 1.0e3;
    let criticalDamping = 2.0 * Math.sqrt(stiffness * mass);

    const originAnchor = new RAPIER.Vector3(0.0, 0.0, 0.0);

    for (let i = 0; i < num; ++i) {
        let xPos = -6 + 1.5 * i;
        let ballPos = new RAPIER.Vector3(xPos, 4.5, 0.0);
        let ballRBDesc = RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(ballPos.x, ballPos.y, ballPos.z)
            .setCanSleep(false);

        let ballRigidBody = world.createRigidBody(ballRBDesc);
        let ballColliderDesc = RAPIER.ColliderDesc.ball(radius);
        world.createCollider(ballColliderDesc, ballRigidBody);

        let dampingRatio = i / (num / 2);
        let damping = dampingRatio * criticalDamping;
        let anchor1 = new RAPIER.Vector3(ballPos.x, ballPos.y - 3, ballPos.z);

        let springJoint = RAPIER.JointData.spring(
            0,
            stiffness,
            damping,
            anchor1,
            originAnchor,
        );

        world.createImpulseJoint(
            springJoint,
            groundRigidBody,
            ballRigidBody,
            true,
        );

        // box on top of the spring
        let boxDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(
            ballPos.x,
            ballPos.y + 3,
            ballPos.z,
        );
        let boxRigidBody = world.createRigidBody(boxDesc);
        let boxColliderDesc = RAPIER.ColliderDesc.cuboid(
            radius,
            radius,
            radius,
        ).setDensity(100);

        world.createCollider(boxColliderDesc, boxRigidBody);
    }
}

export function initWorld(RAPIER: RAPIER_API, testbed: Testbed) {
    let gravity = new RAPIER.Vector3(0.0, -9.81, 0.0);
    let world = new RAPIER.World(gravity);

    createSpringJoints(RAPIER, world, new RAPIER.Vector3(0.0, 10.0, 0.0), 30);

    testbed.setWorld(world);
    let cameraPosition = {
        eye: {x: 20, y: 5.0, z: 50},
        target: {x: 19.0, y: 5, z: 1.0},
    };
    testbed.lookAt(cameraPosition);
}
