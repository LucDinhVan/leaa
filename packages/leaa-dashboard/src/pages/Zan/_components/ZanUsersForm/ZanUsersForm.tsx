import cx from 'classnames';
import React, { useState } from 'react';
import { useMutation } from '@apollo/react-hooks';
import { useTranslation } from 'react-i18next';

import { Zan } from '@leaa/common/src/entrys';
import { FormCard, UserAvatar, ConfirmDeleteButton } from '@leaa/dashboard/src/components';
import { msgMessage } from '@leaa/dashboard/src/utils';
import { DELETE_ZAN_USER, GET_ZAN } from '@leaa/dashboard/src/graphqls';

import { ZanProgress } from '../ZanProgress/ZanProgress';
import { LikeZanButton } from '../LikeZanButton/LikeZanButton';

import style from './style.module.less';

interface IProps {
  item?: Zan;
  loading?: boolean;
  className?: string;
}

export const ZanUsersForm = (props: IProps) => {
  const { t } = useTranslation();

  // mutation
  const [submitVariables, setSubmitVariables] = useState<{ id?: string; userId?: string | null }>({
    id: props.item?.id,
    userId: null,
  });
  const [likeZanMutate, likeZanMutation] = useMutation<{ zan: Zan }>(DELETE_ZAN_USER, {
    variables: submitVariables,
    // apollo-link-error onError: e => messageUtil.gqlError(e.message),
    onCompleted(e) {
      msgMessage(t('_page:Zan.deletedLikeUser'));
    },
    refetchQueries: () => [{ query: GET_ZAN, variables: { id: props.item?.id } }],
  });

  const deleteZanUser = async (userId: string) => {
    await setSubmitVariables({
      id: props.item?.id,
      userId,
    });
    await likeZanMutate();
  };

  return (
    <div className={cx(style['wrapper'], props.className)}>
      <FormCard
        title={
          <>
            <span>{t('_page:Zan.zanUserList')}</span>
            <LikeZanButton id={props.item?.id} />

            <div className={style['creator-info']}>
              <small>{t('_lang:creator')}</small>
              <UserAvatar url={props.item?.creator?.avatar_url || ''} id={props.item?.creator?.id} size={24} />
            </div>
          </>
        }
      >
        <ZanProgress item={props.item} />

        <div className={style['user-avatar-list']}>
          {props.item?.users?.map((user) => (
            <div key={user.id} className={style['user-avatar-item']}>
              <ConfirmDeleteButton
                opacity={1}
                loading={likeZanMutation.loading}
                onClick={() => deleteZanUser(user.id)}
                className={style['delete-user']}
              />
              <UserAvatar url={user.avatar_url} id={user.id} size={64} border={2} className={style['user-avatar']} />
            </div>
          ))}
        </div>
      </FormCard>
    </div>
  );
};
