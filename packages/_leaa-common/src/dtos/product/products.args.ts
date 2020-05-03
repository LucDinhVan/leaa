import { ArgsType, Field, Int } from '@nestjs/graphql';

import { ItemsArgs } from '@leaa/common/src/dtos/_common';

@ArgsType()
export class ProductsArgs extends ItemsArgs {
  @Field(() => String, { nullable: true })
  tagName?: string;

  @Field(() => String, { nullable: true })
  styleName?: string;

  @Field(() => String, { nullable: true })
  brandName?: string;

  @Field(() => String, { nullable: true })
  styleId?: string;

  @Field(() => String, { nullable: true })
  brandId?: string;
}
