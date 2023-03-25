enum EnumDataType {
  number = 'Number',
  string = 'String',
  boolean = 'Boolean',
  null = 'Null',
  undefined = 'Undefined',
  object = 'Object',
  array = 'Array',
  date = 'Date',
  regexp = 'RegExp',
  function = 'Function',
}

function is(val: unknown, type: string) {
  return Object.prototype.toString.call(val) === `[object ${type}]`
}

export function isArray(data: unknown): data is Array<any> {
  return is(data, EnumDataType.array)
}

export function isString(data: unknown): data is string {
  return is(data, EnumDataType.string)
}
