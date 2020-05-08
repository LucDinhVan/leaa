import _ from 'lodash';
import cx from 'classnames';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import queryString from 'query-string';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { Table } from 'antd';

import { DEFAULT_PAGE_SIZE_OPTIONS, PAGE_CARD_TITLE_CREATE_ICON } from '@leaa/dashboard/src/constants';
import { GET_ARTICLES, DELETE_ARTICLE, UPDATE_ARTICLE } from '@leaa/dashboard/src/graphqls';

import { Article, Tag as TagEntry } from '@leaa/common/src/entrys';
import { ArticlesWithPaginationObject, ArticlesArgs } from '@leaa/common/src/dtos/article';
import { IPage, IKey, ITablePagination } from '@leaa/dashboard/src/interfaces';
import {
  mergeParamToUrlQuery,
  getPaginationByUrl,
  pickPaginationByUrl,
  pickOrderByByUrl,
  formatOrderSortByUrl,
  formatOrderByByUrl,
  initPaginationStateByUrl,
  calcTableDefaultSortOrder,
  msgMessage,
} from '@leaa/dashboard/src/utils';

import {
  Rcon,
  PageCard,
  HtmlMeta,
  TableCard,
  SearchInput,
  FilterIcon,
  TagMiniSets,
  TagSearchBox,
  ExportButton,
  TableColumnId,
  TableColumnDate,
  SelectCategoryIdByTree,
  TableColumnDeleteButton,
  TableColumnStatusSwitch,
} from '@leaa/dashboard/src/components';

import style from './style.module.less';

export default (props: IPage) => {
  const { t } = useTranslation();

  const urlParams = queryString.parse(window.location.search);
  const urlPagination = getPaginationByUrl(urlParams);

  const [tablePagination, setTablePagination] = useState<ITablePagination>(initPaginationStateByUrl(urlParams));
  const [selectedRowKeys, setSelectedRowKeys] = useState<IKey[]>([]);

  // filter
  const [q, setQ] = useState<string | undefined>(urlParams.q ? String(urlParams.q) : undefined);
  const [tagName, setTagName] = useState<string | undefined>(urlParams.tagName ? String(urlParams.tagName) : undefined);
  const [categoryId, setCategoryId] = useState<string | undefined>(
    urlParams.categoryId ? String(urlParams.categoryId) : undefined,
  );

  // query
  const getArticlesVariables = { ...tablePagination, q, tagName, categoryId };
  const getArticlesQuery = useQuery<{ articles: ArticlesWithPaginationObject }, ArticlesArgs>(GET_ARTICLES, {
    variables: getArticlesVariables,
    fetchPolicy: 'network-only',
  });

  // mutation
  const [deleteArticleMutate, deleteArticleMutation] = useMutation<Article>(DELETE_ARTICLE, {
    // apollo-link-error onError: e => messageUtil.gqlError(e.message),
    onCompleted: () => msgMessage(t('_lang:deletedSuccessfully')),
    refetchQueries: () => [{ query: GET_ARTICLES, variables: getArticlesVariables }],
  });

  const resetUrlParams = () => {
    setTablePagination({
      page: urlPagination.page,
      pageSize: urlPagination.pageSize,
      orderBy: undefined,
      orderSort: undefined,
    });

    setSelectedRowKeys([]);
    setQ(undefined);
    setTagName(undefined);
    setCategoryId(undefined);
  };

  useEffect(() => {
    if (_.isEmpty(urlParams)) resetUrlParams(); // change route reset url
  }, [props.history.location.key]);

  const rowSelection = {
    columnWidth: 30,
    onChange: (keys: IKey[]) => setSelectedRowKeys(keys),
    selectedRowKeys,
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 75, // ID
      sorter: true,
      sortOrder: calcTableDefaultSortOrder(tablePagination.orderSort, tablePagination.orderBy, 'id'),
      render: (id: string) => <TableColumnId id={id} link={`${props.route.path}/${id}`} />,
    },
    {
      title: t('_lang:title'),
      dataIndex: 'title',
      sorter: true,
      sortOrder: calcTableDefaultSortOrder(tablePagination.orderSort, tablePagination.orderBy, 'title'),
      render: (text: string, record: Article) => (
        <>
          <Link to={`${props.route.path}/${record.id}`}>{record.title}</Link>
          <small className={style['col-slug']}>{record.slug}</small>

          <TagMiniSets tags={record.tags} />
        </>
      ),
    },
    {
      title: t('_lang:category'),
      dataIndex: 'category',
      width: 100,
      render: (text: string, record: Article) => (
        <span>{record.categories && record.categories.length > 0 ? record.categories[0].name : '----'}</span>
      ),
    },
    {
      title: t('_lang:createdAt'),
      dataIndex: 'created_at',
      width: 120,
      sorter: true,
      sortOrder: calcTableDefaultSortOrder(tablePagination.orderSort, tablePagination.orderBy, 'created_at'),
      render: (text: string) => <TableColumnDate date={text} size="small" />,
    },
    {
      title: t('_lang:status'),
      dataIndex: 'status',
      width: 60,
      render: (text: string, record: Article) => (
        <TableColumnStatusSwitch
          id={record.id}
          value={Number(record.status)}
          size="small"
          variablesField="article"
          mutation={UPDATE_ARTICLE}
          refetchQueries={[{ query: GET_ARTICLES, variables: getArticlesVariables }]}
        />
      ),
    },
    {
      title: t('_lang:action'),
      dataIndex: 'operation',
      width: 60,
      render: (text: string, record: Article) => (
        <TableColumnDeleteButton
          id={record.id}
          fieldName={record.title}
          loading={deleteArticleMutation.loading}
          onClick={async () => deleteArticleMutate({ variables: { id: record.id } })}
        />
      ),
    },
  ];

  const onFilter = (params: { field: string; value?: string | string[] | null }) => {
    setTablePagination({ ...tablePagination, page: 1 });

    const filterParams: { q?: string; categoryId?: string; brandId?: string; tagName?: string } = {};

    if (params.field === 'q') {
      const result = params.value ? String(params.value) : undefined;

      setQ(result);
      filterParams.q = result;
    }

    if (params.field === 'tagName') {
      const result = params.value ? String(params.value) : undefined;

      setTagName(result);
      filterParams.tagName = result;
    }

    if (params.field === 'categoryId') {
      const result = params.value ? String(params.value) : undefined;

      setCategoryId(result);
      filterParams.categoryId = result;
    }

    mergeParamToUrlQuery({
      window,
      params: { page: 1, ...filterParams },
      replace: true,
    });
  };

  return (
    <PageCard
      title={
        <span>
          <Rcon type={props.route.icon} />
          <strong>{t(`${props.route.namei18n}`)}</strong>
          {props.route.canCreate && (
            <Link className="g-page-card-create-link" to={`${props.route.path}/create`}>
              <Rcon type={PAGE_CARD_TITLE_CREATE_ICON} />
            </Link>
          )}
        </span>
      }
      extra={
        <div className="g-page-card-extra-filter-bar-wrapper">
          <FilterIcon urlParams={urlParams} onClose={() => props.history.push('/articles')} />

          <TagSearchBox
            className={cx('g-extra-filter-bar--item', 'g-extra-filter-bar--tag')}
            useOnBlur
            onSelectTagCallback={(v: TagEntry) => onFilter({ field: 'tagName', value: v.name })}
            onEnterCallback={(v) => onFilter({ field: 'tagName', value: v })}
            value={tagName}
            placeholder={t('_lang:tag')}
          />

          <SelectCategoryIdByTree
            className={cx('g-extra-filter-bar--item', 'g-extra-filter-bar--category')}
            componentProps={{ allowClear: true }}
            onChange={(v) => onFilter({ field: 'categoryId', value: v })}
            value={categoryId || undefined}
            parentSlug="articles"
          />

          <SearchInput
            className={cx('g-extra-filter-bar--item', 'g-extra-filter-bar--q')}
            value={q}
            onChange={(v) => onFilter({ field: 'q', value: v })}
          />

          <ExportButton moduleName="article" params={getArticlesVariables} />
        </div>
      }
      className={style['wapper']}
      loading={getArticlesQuery.loading}
    >
      <HtmlMeta title={t(`${props.route.namei18n}`)} />

      {getArticlesQuery?.data?.articles?.items && (
        <TableCard selectedRowKeys={selectedRowKeys} totalLength={getArticlesQuery.data.articles.total}>
          <Table
            rowKey="id"
            size="small"
            rowSelection={rowSelection}
            columns={columns as any}
            dataSource={getArticlesQuery.data.articles.items}
            pagination={{
              defaultCurrent: tablePagination.page,
              defaultPageSize: tablePagination.pageSize,
              total: getArticlesQuery.data.articles.total,
              current: tablePagination.page,
              pageSize: tablePagination.pageSize,
              //
              pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
              showSizeChanger: true,
            }}
            onChange={(pagination, filters, sorter: any) => {
              setTablePagination({
                ...tablePagination,
                page: pagination.current,
                pageSize: pagination.pageSize,
                orderBy: formatOrderByByUrl(sorter.field),
                orderSort: formatOrderSortByUrl(sorter.order),
              });

              mergeParamToUrlQuery({
                window,
                params: {
                  ...pickPaginationByUrl(pagination),
                  ...pickOrderByByUrl(sorter),
                },
                replace: true,
              });
            }}
          />
        </TableCard>
      )}
    </PageCard>
  );
};
