import { updateCamera } from "@react-three/fiber/dist/declarations/src/core/utils"
import { between, insideSphere, upTo } from "randomish"
import { useMemo } from "react"
import {
  AdditiveBlending,
  MeshStandardMaterial,
  TextureLoader,
  Vector3
} from "three"
import {
  Delay,
  Emitter,
  MeshParticles,
  ParticlesMaterial,
  Repeat,
  SpawnSetup,
  VisualEffect
} from "three-vfx"

export const Fog = () => {
  const texture = useMemo(
    () => new TextureLoader().load("/textures/smoke.png"),
    []
  )

  const setup: SpawnSetup = (c) => {
    c.position.copy(insideSphere(20) as Vector3)
    c.velocity.randomDirection().multiplyScalar(between(0, 1))
    c.lifetime = 60
    c.scaleStart.setScalar(between(1, 50))
    c.scaleEnd.setScalar(0)
    c.alphaStart = between(0.05, 0.1)
    c.alphaEnd = 0
  }

  return (
    <VisualEffect>
      <MeshParticles maxParticles={500}>
        <planeGeometry />

        <ParticlesMaterial
          baseMaterial={MeshStandardMaterial}
          map={texture}
          blending={AdditiveBlending}
          depthTest={true}
          depthWrite={false}
          billboard
          transparent
        />

        <Emitter count={50} setup={setup} />

        <Delay seconds={10}>
          <Repeat interval={10}>
            <Emitter count={10} setup={setup} />
          </Repeat>
        </Delay>
      </MeshParticles>
    </VisualEffect>
  )
}
