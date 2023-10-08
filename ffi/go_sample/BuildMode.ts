const _BuildMode = [
  "test",
  "debug",
  "release"
] as const;
  
type BuildMode = typeof _BuildMode[number];

/**
 * Type 
 * @param {string} build_mode you want to check string
 */
function build_mode_type_guard(build_mode: string):build_mode  is BuildMode{
  return _BuildMode.includes(build_mode as BuildMode);
}

export {
  type BuildMode,
  build_mode_type_guard
}
