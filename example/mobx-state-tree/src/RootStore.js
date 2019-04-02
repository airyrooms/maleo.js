import { types } from 'mobx-state-tree'
import makeInspectable from 'mobx-devtools-mst' //* For debugging purpose *//

import { UserModel } from './Model'

//*********  Create Root Store Model  **********//
const RootModel = types.model('RootModel', {
  userStore: types.array(UserModel)
})

//*********  Initialize Root Store  **********//
const RootStore = RootModel.create({
  userStore: [
    {
      firstName: 'John',
      lastName: 'Doe',
      birthDate: '09-09-1999'
    }
  ]
})


//*--------  For debugging purpose also install mobx dev tool (chrome extension)  --------*//
makeInspectable(RootStore)

export {
  RootStore
}
