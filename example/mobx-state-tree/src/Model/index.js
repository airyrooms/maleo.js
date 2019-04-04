import  { types } from 'mobx-state-tree'


//*********  Create User Store Model  **********//
export const UserModel = types.model('UserModel', {
  firstName: types.string,
  lastName: types.string,
  birthDate: types.string
})
