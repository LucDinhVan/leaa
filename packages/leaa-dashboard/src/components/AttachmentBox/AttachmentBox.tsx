import cx from 'classnames';
import { useTranslation } from 'react-i18next';
import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { Tooltip } from 'antd';

import { GET_ATTACHMENTS, UPDATE_ATTACHMENTS } from '@leaa/dashboard/src/graphqls';
import { IAttachmentParams } from '@leaa/common/src/interfaces';

import { Attachment } from '@leaa/common/src/entrys';
import { removeLangSpace, successMessage } from '@leaa/dashboard/src/utils';
import {
  AttachmentsArgs,
  AttachmentsWithPaginationObject,
  UpdateAttachmentsInput,
} from '@leaa/common/src/dtos/attachment';

import { FormCard } from '@leaa/dashboard/src/components';

import { AttachmentList } from './_components/AttachmentList/AttachmentList';
import { AttachmentDropzone } from './_components/AttachmentDropzone/AttachmentDropzone';

import style from './style.module.less';

interface IProps {
  value?: number | undefined;
  onChange?: (checked: boolean) => void;
  attachmentParams?: IAttachmentParams;
  onSubmitCallback?: (v: any) => void;
  type?: 'list' | 'card';
  title?: React.ReactNode;
  disableMessage?: boolean;
  listHeight?: number;
  cardHeight?: number;
  className?: string;
  circle?: boolean;
  onDeleteAttachmentCallback?: (uuid: string | number) => void;
  onUploadedCallback?: (uploaded?: any) => void;
}

export const AttachmentBox = forwardRef((props: IProps, ref: React.Ref<any>) => {
  if (!props.attachmentParams || (props.attachmentParams && !props.attachmentParams.moduleId)) return null;

  const { t, i18n } = useTranslation();

  const type = props.type || 'list';
  const cardHeight = props.cardHeight || 230;
  const listHeight = props.listHeight || 130;

  const attachmentListRef = useRef<any>(null);

  const [getAttachmentsVariables, setgetAttachmentsVariables] = useState<AttachmentsArgs>({
    ...props.attachmentParams,
    orderBy: 'sort',
    orderSort: 'ASC',
  });

  const getAttachmentsQuery = useQuery<{ attachments: AttachmentsWithPaginationObject }, AttachmentsArgs>(
    GET_ATTACHMENTS,
    {
      variables: getAttachmentsVariables,
      fetchPolicy: 'network-only',
    },
  );

  const [submitVariables, setSubmitVariables] = useState<{ attachments: UpdateAttachmentsInput[] }>();
  const [updateAttachmentsMutate] = useMutation<UpdateAttachmentsInput[]>(UPDATE_ATTACHMENTS, {
    variables: submitVariables,
    // apollo-link-error onError: e => messageUtil.gqlError(e.message),
    onCompleted: () =>
      !props.disableMessage &&
      successMessage(`${removeLangSpace(`${t('_lang:attachment')} ${t('_lang:updatedSuccessfully')}`, i18n.language)}`),
    refetchQueries: () => [{ query: GET_ATTACHMENTS, variables: getAttachmentsVariables }],
  });

  const refreshAttachments = (uuid: string | number) => {
    // TODO here can save prev AttachmentList and then refresh
    // <code...>

    setgetAttachmentsVariables({
      ...props.attachmentParams,
      orderBy: 'sort',
      orderSort: 'ASC',
      refreshHash: new Date().getMilliseconds(),
    });

    if (props.onDeleteAttachmentCallback) {
      props.onDeleteAttachmentCallback(uuid);
    }

    if (props.onUploadedCallback) {
      props.onUploadedCallback(uuid);
    }
  };

  const pickAttachments = (attachments: Attachment[]): UpdateAttachmentsInput[] =>
    attachments.map((a) => ({
      uuid: a.uuid,
      title: a.title,
      link: a.link || undefined,
      sort: Number(a.sort),
      status: Number(a.status),
    }));

  // from children onChangeAttachmentsCallback
  const onChangeAttachments = async (attachments: Attachment[]) => {
    if (attachments && attachments.length > 0) {
      await setSubmitVariables({ attachments: pickAttachments(attachments) });
      await updateAttachmentsMutate();
    }
  };

  // from parent
  const onUpdateAttachments = async () => {
    if (attachmentListRef.current?.attachments?.length > 0) {
      await setSubmitVariables({ attachments: pickAttachments(attachmentListRef.current.attachments) });
      await updateAttachmentsMutate();
    }
  };

  useImperativeHandle<{}, any>(
    ref,
    () => ({
      onUpdateAttachments,
      onChangeAttachments,
    }),
    [],
  );

  return (
    <div
      className={cx(style['attachment-box-wrapper'], props.className, {
        [style['wrapper-box--list']]: type === 'list',
        [style['wrapper-box--card']]: type === 'card',
        [style['wrapper-box--circle']]: props.circle,
      })}
      style={{ height: type === 'card' ? cardHeight : undefined }}
    >
      <FormCard
        title={
          <>
            {props.title ||
              removeLangSpace(
                `${t('_lang:attachment')} ${type === 'list' ? t('_lang:list') : t('_lang:card')}`,
                i18n.language,
              )}

            <Tooltip
              title={
                <code className={style['title-code-tooltip']}>
                  {props.attachmentParams?.type}-{props.attachmentParams?.moduleName}-{/* prettier-ignore */}
                  {props.attachmentParams?.typeName}-{props.attachmentParams?.moduleId}
                </code>
              }
              trigger="hover"
            >
              <code className={style['title-code-text']}>
                {props.attachmentParams?.typeName}
                <small>{props.attachmentParams?.typePlatform}</small>
                <small>{props.attachmentParams?.moduleId}</small>
              </code>
            </Tooltip>
          </>
        }
      >
        <AttachmentDropzone
          attachmentParams={props.attachmentParams && { ...props.attachmentParams }}
          onUploadedCallback={(uuid) => refreshAttachments(uuid)}
          attachments={getAttachmentsQuery.data?.attachments?.items}
          type={type}
          cardHeight={cardHeight}
          circle={props.circle}
        />

        <AttachmentList
          ref={attachmentListRef}
          attachmentParams={props.attachmentParams && { ...props.attachmentParams }}
          attachments={getAttachmentsQuery.data?.attachments?.items}
          onChangeAttachmentsCallback={onChangeAttachments}
          onDeleteAttachmentCallback={(uuid) => refreshAttachments(uuid)}
          type={type}
          listHeight={listHeight}
          cardHeight={cardHeight}
          circle={props.circle}
        />
      </FormCard>
    </div>
  );
});
