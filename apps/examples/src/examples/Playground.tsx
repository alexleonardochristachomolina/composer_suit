import { between, plusMinus } from "randomish"
import { useEffect, useRef } from "react"
import { Mul, OneMinus } from "shader-composer"
import { Vector3 } from "three"
import {
  AccelerationModule,
  ParticleProgress,
  Particles,
  ScaleModule,
  VelocityModule
} from "vfx-composer"

export default function Playground() {
  const particles = useRef<Particles>(null!)

  useEffect(() => {
    const { spawn } = particles.current

    const id = setInterval(() => {
      spawn()
    }, 80)

    return () => clearInterval(id)
  }, [])

  return (
    <Particles
      ref={particles}
      position-y={2}
      modules={[
        /*
        Scale the particle. Pass a Shader Unit to steer scale over time.
        */
        ScaleModule(OneMinus(ParticleProgress)),

        /*
        Perform gravity. Gravity is the same for all particles, so we're using
        a constant Vector3 value here.
        */
        AccelerationModule(new Vector3(0, -9.81, 0)),

        /*
        Simulate velocity. Velocity should be different for each particle, so
        we're passing a function that returns a new Vector3 for every spawned
        particle. The module will automatically set up an instanced buffer
        attribute and upload newly filled values to the GPU. ✨
        */
        VelocityModule(
          () => new Vector3(plusMinus(3), between(5, 15), plusMinus(3))
        ),

        (payload) => ({ ...payload, position: Mul(payload.position, 2) })
      ]}
    >
      {/* You can assign any geometry. */}
      <boxGeometry />

      {/* And any material! */}
      <meshStandardMaterial color="white" />
    </Particles>
  )
}
