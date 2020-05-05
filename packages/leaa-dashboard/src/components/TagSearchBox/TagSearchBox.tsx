import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import cx from 'classnames';
import _ from 'lodash';
import { AutoComplete, Input } from 'antd';
import { AutoCompleteProps } from 'antd/es/auto-complete';
import { LoadingOutlined } from '@ant-design/icons';

import { Tag as TagEntry } from '@leaa/common/src/entrys';
import { TagsWithPaginationObject, TagArgs } from '@leaa/common/src/dtos/tag';
import { GET_TAGS } from '@leaa/dashboard/src/graphqls';
import { apolloClient } from '@leaa/dashboard/src/libs';

import style from './style.module.less';

interface IProps extends AutoCompleteProps {
  className?: string;
  useOnBlur?: boolean;
  enterCreateTag?: boolean;
  value?: string;
  autoFocus?: boolean;
  onSelectTagCallback?: (tag: TagEntry) => void;
  onEnterCallback?: (tag?: string) => void;
  onChangeTagNameCallback?: (tag?: string) => void;
  placeholder?: string;
}

const DEBOUNCE_MS = 500;

export const TagSearchBox = forwardRef((props: IProps, ref: React.Ref<any>) => {
  const { t } = useTranslation();

  const [inputKey, setInputKey] = useState<string | undefined>(props.value);
  const [optionalTags, setOptionalTags] = useState<TagEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const init = () => {
    setLoading(false);
    setInputKey(undefined);
    setOptionalTags([]);
  };

  useEffect(() => {
    return () => init();
  }, []);

  const queryTags = useRef(
    _.debounce((v: string) => {
      setLoading(true);
      setOptionalTags([]);

      apolloClient
        .query<{ tags: TagsWithPaginationObject }, TagArgs>({
          query: GET_TAGS,
          variables: { page: 1, pageSize: 10, q: v },
          // fetchPolicy: 'network-only',
        })
        .then((result: { data: { tags: TagsWithPaginationObject } }) => {
          if (result && result.data.tags && result.data.tags.items) {
            setOptionalTags(result.data.tags.items);
          }
        })
        .finally(() => setLoading(false));
    }, DEBOUNCE_MS),
  );

  // query tags
  const onQueryTags = (tag: string) => queryTags.current(tag);

  const onClear = () => {
    init();
  };

  const onChange = (v: any) => {
    setInputKey(v);

    if (props.onChangeTagNameCallback) {
      props.onChangeTagNameCallback(v);
    }

    if (typeof v === 'undefined') {
      onClear();

      if (props.onEnterCallback) {
        props.onEnterCallback(undefined);
      }
    }
  };

  const onSearch = (v: string) => {
    onQueryTags(v);
  };

  const onSelect = (tagName: any) => {
    const tagObject = optionalTags.find((item) => item.name === tagName);

    if (props.onSelectTagCallback && tagObject) {
      props.onSelectTagCallback(tagObject);
    }
  };

  const onEnter = (e: any) => {
    if (props.onEnterCallback) {
      props.onEnterCallback(e.currentTarget.value);
    }

    // TIPS:
    // It triggers both `onSelect` & `onEnter` when `onSelect` press Enter
    // So, don't use `onSelect` in here
  };

  // TIPS: onEnter & onSelect will be CONFLICT!
  return (
    <div className={cx(style['wrapper'], props.className)}>
      <div className={cx(style['container'])}>
        <AutoComplete
          // backfill
          ref={ref}
          autoFocus={props.autoFocus}
          allowClear
          defaultActiveFirstOption={false}
          style={{ width: '100%' }}
          onSearch={onSearch}
          onChange={onChange}
          onSelect={onSelect}
          options={optionalTags.map((tag) => ({
            label: tag.name,
            value: tag.name,
          }))}
          value={inputKey}
        >
          <Input
            onPressEnter={onEnter}
            suffix={loading ? <LoadingOutlined /> : <span />}
            placeholder={props.placeholder || t('_comp:SelectTagId.searchTags')}
          />
        </AutoComplete>
      </div>
    </div>
  );
});
