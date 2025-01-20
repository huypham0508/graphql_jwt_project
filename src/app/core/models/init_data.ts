import { seedRoles } from "./role/role.model"

const initializeModels = async () => {
    await seedRoles();
}

export default initializeModels