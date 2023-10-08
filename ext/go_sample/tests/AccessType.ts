// file access mode
const X_OK = 1;
const W_OK = 2;
const R_OK = 4;

const _accessType = [
    0,
    X_OK,
    W_OK,
    X_OK | W_OK,
    R_OK,
    X_OK | R_OK,
    W_OK | R_OK,
    X_OK | W_OK | R_OK
] as const;
  
type AccessType = typeof _accessType[number];

/**
 * Type 
 * @param {number} access_type you want to check string
 */
function access_type_type_guard(access_type: number):access_type  is AccessType{
return _accessType.includes(access_type as AccessType);
}

export {
  type AccessType,
  X_OK, W_OK, R_OK,
  access_type_type_guard
}
