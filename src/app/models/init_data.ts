import { initializeRoles } from "./role/role.model"

const initializeModels = async () => {
    await initializeRoles();
}

export default initializeModels