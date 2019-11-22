import React, { useState } from 'react';
import { Button, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@apollo/react-hooks';

import { Tag } from '@leaa/common/src/entrys';
import { CreateTagInput } from '@leaa/common/src/dtos/tag';
import { IPage } from '@leaa/dashboard/src/interfaces';
import { CREATE_TAG } from '@leaa/common/src/graphqls';
import { CREATE_BUTTON_ICON } from '@leaa/dashboard/src/constants';

import { HtmlMeta, PageCard, ErrorCard, SubmitBar } from '@leaa/dashboard/src/components';

import { TagInfoForm } from '../_components/TagInfoForm/TagInfoForm';

import style from './style.module.less';

export default (props: IPage) => {
  const { t } = useTranslation();

  // ref
  const [tagInfoFormRef, setTagInfoFormRef] = useState<any>();

  // mutation
  const [submitVariables, setSubmitVariables] = useState<{ tag: CreateTagInput }>();
  const [createTagMutate, createTagMutation] = useMutation<{ createTag: Tag }>(CREATE_TAG, {
    variables: submitVariables,
    onError: e => message.error(e.message),
    onCompleted({ createTag }) {
      message.success(t('_lang:createdSuccessfully'));
      props.history.push(`/tags/${createTag.id}`);
    },
  });

  const onSubmit = async () => {
    tagInfoFormRef.props.form.validateFieldsAndScroll(async (err: any, formData: CreateTagInput) => {
      if (err) {
        message.error(err[Object.keys(err)[0]].errors[0].message);

        return;
      }

      await setSubmitVariables({ tag: formData });
      await createTagMutate();
    });
  };

  return (
    <PageCard title={t(`${props.route.namei18n}`)} className={style['wapper']} loading={createTagMutation.loading}>
      <HtmlMeta title={t(`${props.route.namei18n}`)} />

      {createTagMutation.error ? <ErrorCard error={createTagMutation.error} /> : null}

      <TagInfoForm wrappedComponentRef={(inst: unknown) => setTagInfoFormRef(inst)} />

      <SubmitBar>
        <Button
          type="primary"
          size="large"
          icon={CREATE_BUTTON_ICON}
          className="submit-button"
          loading={createTagMutation.loading}
          onClick={onSubmit}
        >
          {t('_lang:create')}
        </Button>
      </SubmitBar>
    </PageCard>
  );
};
