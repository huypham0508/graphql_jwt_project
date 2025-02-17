import { Field, ObjectType } from "type-graphql";
import { IMutationResponse } from "../IMutationResponse";
import { IRole } from "../../..//models/role/role.model";


@ObjectType({ implements: IMutationResponse })
export class RolesResponse implements IMutationResponse {
    code: number;
    success: boolean;
    message?: string;

    @Field(() => [IRole], { nullable: true })
    data?: IRole[]
}
