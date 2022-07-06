import { Color, Matrix3, Matrix4, Vector2, Vector3, Vector4 } from "three"
import { glslRepresentation } from "./glslRepresentation"
import { type } from "./glslType"
import { identifier } from "./lib/concatenator3000"
import idGenerator from "./lib/idGenerator"

export type GLSLType =
  | "bool"
  | "float"
  | "vec2"
  | "vec3"
  | "vec4"
  | "mat3"
  | "mat4"

export type JSTypes = {
  bool: boolean
  float: number
  vec2: Vector2
  vec3: Vector3 | Color
  vec4: Vector4
  mat3: Matrix3
  mat4: Matrix4
}

export type Value<T extends GLSLType = any> = string | JSTypes[T] | Variable<T>

export type Variable<T extends GLSLType = any> = {
  _: "Variable"
  id: number
  title: string
  name: string
  type: T
  value: Value<T>
  inputs: Record<string, Value>
  only?: "vertex" | "fragment"
  vertexHeader?: string
  vertexBody?: string
  fragmentHeader?: string
  fragmentBody?: string

  Add: (...operands: Value[]) => Variable<T>
  Subtract: (...operands: Value[]) => Variable<T>
  Multiply: (...operands: Value[]) => Variable<T>
  Divide: (...operands: Value[]) => Variable<T>
}

const nextAnonymousId = idGenerator()

const buildMultiInputs = (values: Value[]) =>
  values.reduce((acc, v, i) => ({ ...acc, [`m_${i}`]: v }), {})

/* TODO: somehow move this somewhere else again, without causing a circular dependency */
export const Operator = (title: string, operator: "+" | "-" | "*" | "/") => <
  T extends GLSLType
>(
  a: Value<T>,
  ...rest: Value[]
) => {
  const inputs = buildMultiInputs([a, ...rest])

  return variable(type(a), Object.keys(inputs).join(operator), {
    title: `${title} (${type(a)})`,
    inputs
  })
}

export const Add = Operator("Add", "+")
export const Subtract = Operator("Subtract", "-")
export const Multiply = Operator("Multiply", "*")
export const Divide = Operator("Divide", "/")

export const variable = <T extends GLSLType>(
  type: T,
  value: Value<T>,
  extras: Partial<Variable<T>> = {}
) => {
  const id = nextAnonymousId()

  const v: Variable<T> = {
    id,
    title: `Anonymous ${type} = ${glslRepresentation(value)}`,
    name: identifier("anonymous", id),
    inputs: {},
    ...extras,
    _: "Variable",
    type,
    value,

    /* Math helpers! */
    Add: (...operands: Value[]) => Add(v, ...operands),
    Subtract: (...operands: Value[]) => Subtract(v, ...operands),
    Multiply: (...operands: Value[]) => Multiply(v, ...operands),
    Divide: (...operands: Value[]) => Divide(v, ...operands)
  }

  return v
}

export function isVariable(v: any): v is Variable {
  return v && v._ === "Variable"
}

/* Helpers */

const makeVariableHelper = <T extends GLSLType>(type: T) => (
  v: Value<T>,
  extras?: Partial<Variable<T>>
) => variable(type, v, extras)

export const float = makeVariableHelper("float")
export const bool = makeVariableHelper("bool")
export const vec2 = makeVariableHelper("vec2")
export const vec3 = makeVariableHelper("vec3")
export const vec4 = makeVariableHelper("vec4")
export const mat3 = makeVariableHelper("mat3")
export const mat4 = makeVariableHelper("mat4")
