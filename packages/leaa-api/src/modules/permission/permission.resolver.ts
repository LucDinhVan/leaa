import { UseGuards } from '@nestjs/common';
import { Args, Query, Mutation, Resolver, Int } from '@nestjs/graphql';

import { Permission } from '@leaa/common/src/entrys';
import {
  PermissionsArgs,
  PermissionsWithPaginationObject,
  PermissionArgs,
  CreatePermissionInput,
  UpdatePermissionInput,
} from '@leaa/common/src/dtos/permission';
import { PermissionService } from '@leaa/api/src/modules/permission/permission.service';
import { Permissions, GqlCtx } from '@leaa/api/src/decorators';
import { PermissionsGuard } from '@leaa/api/src/guards';
import { IGqlCtx } from '@leaa/api/src/interfaces';

@Resolver(() => Permission)
export class PermissionResolver {
  constructor(private readonly permissionService: PermissionService) {}

  @UseGuards(PermissionsGuard)
  @Permissions('permission.list-read')
  @Query(() => PermissionsWithPaginationObject)
  async permissions(@Args() args: PermissionsArgs): Promise<PermissionsWithPaginationObject> {
    return this.permissionService.permissions(args);
  }

  @UseGuards(PermissionsGuard)
  @Permissions('permission.item-read')
  @Query(() => Permission)
  async permission(
    @Args({ name: 'id', type: () => String }) id: string,
    @Args() args: PermissionArgs,
  ): Promise<Permission | undefined> {
    return this.permissionService.permission(id, args);
  }

  @UseGuards(PermissionsGuard)
  @Permissions('permission.item-create')
  @Mutation(() => Permission)
  async createPermission(@Args('permission') args: CreatePermissionInput): Promise<Permission | undefined> {
    return this.permissionService.createPermission(args);
  }

  @UseGuards(PermissionsGuard)
  @Permissions('permission.item-update')
  @Mutation(() => Permission)
  async updatePermission(
    @Args({ name: 'id', type: () => String }) id: string,
    @Args('permission') args: UpdatePermissionInput,
    @GqlCtx() gqlCtx?: IGqlCtx,
  ): Promise<Permission | undefined> {
    return this.permissionService.updatePermission(id, args, gqlCtx);
  }

  @UseGuards(PermissionsGuard)
  @Permissions('permission.item-delete')
  @Mutation(() => Permission)
  async deletePermission(
    @Args({ name: 'id', type: () => String }) id: string,
    @GqlCtx() gqlCtx?: IGqlCtx,
  ): Promise<Permission | undefined> {
    return this.permissionService.deletePermission(id, gqlCtx);
  }
}
