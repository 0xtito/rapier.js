import type RAPIER from "@dimforge/rapier3d";
import type {Testbed} from "../Testbed";

type RAPIER_API = typeof import("@dimforge/rapier3d");

function createTower(
    RAPIER: RAPIER_API,
    world: RAPIER.World,
    width: number,
    height: number,
) {
    let rad = 0.1;

    let shift = rad * 2.0;
    let centerX = shift * (width / 2);
    let centerY = 3;
    let centerZ = shift;

    for (let i = 0; i < height; i++) {
        let isEvenLayer = i % 2 === 0;

        for (let j = 0; j < width; j++) {
            for (let k = 0; k < width; k++) {
                let x, y, z;

                if (isEvenLayer) {
                    x = j * shift - centerX;
                    z = k * shift - centerZ;
                } else {
                    x = k * shift - centerX;
                    z = j * shift - centerZ;
                }

                y = i * shift + centerY;

                const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
                    .setTranslation(x, y, z)
                    .setAdditionalMass(0.05);

                let body = world.createRigidBody(bodyDesc);

                let colliderDesc = RAPIER.ColliderDesc.cuboid(rad, rad, rad);
                world.createCollider(colliderDesc, body);
            }
        }
    }
}

function createFloor(RAPIER: RAPIER_API, world: RAPIER.World) {
    let groundDesc = RAPIER.RigidBodyDesc.fixed();
    let groundRigidBody = world.createRigidBody(groundDesc);

    const bodyDesc = RAPIER.RigidBodyDesc.fixed();
    const groundBody = world.createRigidBody(bodyDesc);
    const colliderDesc = RAPIER.ColliderDesc.cuboid(
        5.0,
        0.1,
        5.0,
    ).setTranslation(1, 2.5, 1);
    world.createCollider(colliderDesc, groundBody);
}

function createWreckingBall(RAPIER: RAPIER_API, world: RAPIER.World) {
    const ropeLength = 5;

    // Create the anchor
    const anchorDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(0, 10, 0);

    const anchorRigidBody = world.createRigidBody(anchorDesc);

    const anchorColliderDesc = RAPIER.ColliderDesc.cuboid(0.1, 0.1, 0.1);

    world.createCollider(anchorColliderDesc, anchorRigidBody);

    // Create the ball
    const ballRadius = 1;
    let ballPos = new RAPIER.Vector3(-3, 8, 3);

    const ballRBDesc = RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(ballPos.x, ballPos.y, ballPos.z)
        .setAdditionalMass(10.0);

    const ballRigidBody = world.createRigidBody(ballRBDesc);

    const colliderDesc = RAPIER.ColliderDesc.ball(ballRadius);

    world.createCollider(colliderDesc, ballRigidBody);

    const ropeJointDesc = RAPIER.JointData.rope(
        ropeLength,
        new RAPIER.Vector3(0, 0, 0),
        new RAPIER.Vector3(0, 0, 0),
    );

    world.createImpulseJoint(
        ropeJointDesc,
        ballRigidBody,
        anchorRigidBody,
        true,
    );
}

export function initWorld(RAPIER: RAPIER_API, testbed: Testbed) {
    let gravity = new RAPIER.Vector3(0.0, -9.81, 0.0);
    let world = new RAPIER.World(gravity);

    createFloor(RAPIER, world);
    createTower(RAPIER, world, 5, 15);
    createWreckingBall(RAPIER, world);

    testbed.setWorld(world);
    let cameraPosition = {
        eye: {x: 12.0, y: 10.0, z: 12.0},
        target: {x: 0.0, y: 5.0, z: 0.0},
    };
    testbed.lookAt(cameraPosition);
}
