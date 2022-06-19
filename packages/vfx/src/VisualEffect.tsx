import { GroupProps } from "@react-three/fiber"

export type VisualEffectProps = GroupProps

export const VisualEffect = (props: VisualEffectProps) => {
  return <group {...props} />
}
