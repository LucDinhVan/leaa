import { Injectable } from '@nestjs/common';
import { Repository, FindOneOptions, In, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Setting } from '@leaa/common/src/entrys';
import {
  SettingsWithPaginationObject,
  CreateSettingInput,
  UpdateSettingInput,
  UpdateSettingsInput,
  SettingsObject,
} from '@leaa/common/src/dtos/setting';
import { argsUtil, loggerUtil, curdUtil, paginationUtil, authUtil, msgUtil } from '@leaa/api/src/utils';
import { ISettingsArgs, ISettingArgs, IGqlCtx } from '@leaa/api/src/interfaces';
import { ConfigService } from '@leaa/api/src/modules/config/config.service';
import { settingSeed } from '@leaa/api/src/modules/seed/seed.data';

const CLS_NAME = 'SettingService';

@Injectable()
export class SettingService {
  constructor(
    @InjectRepository(Setting) private readonly settingRepository: Repository<Setting>,
    private readonly configService: ConfigService,
  ) {}

  async PLEASE_DONT_MODIFY_DEMO_DATA(id?: string, gqlCtx?: IGqlCtx): Promise<boolean> {
    if (this.configService.DEMO_MODE && !process.argv.includes('--nuke')) {
      if (!id) return true;

      const setting = await this.setting(id);

      if (setting && setting.slug && settingSeed.map((seed) => seed.slug).includes(setting.slug)) {
        throw msgUtil.error({ t: ['_error:pleaseDontModify'], gqlCtx });
      }
    }

    return true;
  }

  async settings(args: ISettingsArgs, gqlCtx?: IGqlCtx): Promise<SettingsWithPaginationObject> {
    const nextArgs = argsUtil.format(args, gqlCtx);

    const qb = this.settingRepository.createQueryBuilder();
    qb.select().orderBy({ sort: 'ASC' }).addOrderBy('id', 'ASC');

    if (nextArgs.q) {
      const aliasName = new SelectQueryBuilder(qb).alias;

      ['name', 'slug'].forEach((q) => {
        qb.orWhere(`${aliasName}.${q} LIKE :${q}`, { [q]: `%${nextArgs.q}%` });
      });
    }

    // can
    if (!gqlCtx?.user || (gqlCtx.user && !authUtil.can(gqlCtx.user, 'setting.list-read--private'))) {
      qb.andWhere('private = :private', { private: 0 });
    }

    return paginationUtil.calcQbPageInfo({ qb, page: nextArgs.page, pageSize: nextArgs.pageSize });
  }

  async setting(id: string, args?: ISettingArgs, gqlCtx?: IGqlCtx): Promise<Setting | undefined> {
    let nextArgs: ISettingArgs = {};

    if (args) {
      nextArgs = args;
    }

    const whereQuery: { id: string; private?: number } = { id };

    // can
    if (!gqlCtx?.user || (gqlCtx.user && !authUtil.can(gqlCtx.user, 'setting.list-read--private'))) {
      whereQuery.private = 0;
    }

    const setting = this.settingRepository.findOne({
      ...nextArgs,
      where: whereQuery,
    });

    if (!setting) {
      const message = 'Not Found Setting';

      loggerUtil.warn(message, CLS_NAME);

      return undefined;
    }

    return setting;
  }

  async settingBySlug(slug: string, args?: ISettingArgs, gqlCtx?: IGqlCtx): Promise<Setting | undefined> {
    const whereQuery: { slug: string; private?: number } = { slug };

    // can
    if (!gqlCtx?.user || (gqlCtx.user && !authUtil.can(gqlCtx.user, 'setting.list-read--private'))) {
      whereQuery.private = 0;
    }

    const setting = await this.settingRepository.findOne({ where: whereQuery });

    if (!setting) {
      const message = 'Not Found SettingBySlug';

      loggerUtil.warn(message, CLS_NAME);

      return undefined;
    }

    return this.setting(setting.id, args, gqlCtx);
  }

  async createSetting(args: CreateSettingInput): Promise<Setting | undefined> {
    return this.settingRepository.save({ ...args });
  }

  async updateSetting(
    id: string,
    args: UpdateSettingInput & FindOneOptions,
    gqlCtx?: IGqlCtx,
  ): Promise<Setting | undefined> {
    if (curdUtil.isOneField(args, 'status')) {
      return curdUtil.commonUpdate({ repository: this.settingRepository, CLS_NAME, id, args });
    }

    return curdUtil.commonUpdate({ repository: this.settingRepository, CLS_NAME, id, args });
  }

  async updateSettings(settings: UpdateSettingsInput[], gqlCtx?: IGqlCtx): Promise<SettingsObject> {
    const batchUpdate = settings.map(async (setting) => {
      await this.updateSetting(setting.id, setting);
    });

    let items: Setting[] = [];

    await Promise.all(batchUpdate)
      .then(async () => {
        items = await this.settingRepository.find({ id: In(settings.map((s) => s.id)) });
      })
      .catch(() => {
        throw msgUtil.error({ t: ['_error:updateItemFailed'], gqlCtx });
      });

    return {
      items,
    };
  }

  async deleteSetting(id: string, gqlCtx?: IGqlCtx): Promise<Setting | undefined> {
    if (this.configService.DEMO_MODE) await this.PLEASE_DONT_MODIFY_DEMO_DATA(id, gqlCtx);

    return curdUtil.commonDelete({ repository: this.settingRepository, CLS_NAME, id });
  }
}
