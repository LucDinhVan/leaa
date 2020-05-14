import _ from 'lodash';
import cx from 'classnames';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import queryString from 'query-string';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { Table } from 'antd';

import { DEFAULT_PAGE_SIZE_OPTIONS, PAGE_CARD_TITLE_CREATE_ICON } from '@leaa/dashboard/src/constants';
import { GET_PROMOS, DELETE_PROMO, UPDATE_PROMO } from '@leaa/dashboard/src/graphqls';

import { Promo } from '@leaa/common/src/entrys';
import { PromosWithPaginationObject, PromosArgs } from '@leaa/common/src/dtos/promo';
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
  msg,
} from '@leaa/dashboard/src/utils';

import {
  Rcon,
  PageCard,
  HtmlMeta,
  TableCard,
  SearchInput,
  TableColumnId,
  TableColumnDate,
  TableColumnDeleteButton,
  TableColumnStatusSwitch,
  CouponItem,
  ExportButton,
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

  // query
  const getPromosVariables = { ...tablePagination, q };
  const getPromosQuery = useQuery<{ promos: PromosWithPaginationObject }, PromosArgs>(GET_PROMOS, {
    variables: getPromosVariables,
    fetchPolicy: 'network-only',
  });

  // mutation
  const [deletePromoMutate, deletePromoMutation] = useMutation<Promo>(DELETE_PROMO, {
    // apollo-link-error onError: e => messageUtil.gqlError(e.message),
    onCompleted: () => msg(t('_lang:deletedSuccessfully')),
    refetchQueries: () => [{ query: GET_PROMOS, variables: getPromosVariables }],
  });

  const resetUrlParams = () => {
    setTablePagination({
      page: urlPagination.page,
      pageSize: urlPagination.pageSize,
      orderBy: undefined,
      orderSort: undefined,
    });

    setQ(undefined);
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
      title: t('_page:Promo.promoInfo'),
      dataIndex: 'name',
      render: (text: string, record: Promo) => (
        <CouponItem
          type="promo"
          item={record}
          size="small"
          name={<Link to={`${props.route.path}/${record.id}`}>{record.name}</Link>}
        />
      ),
    },
    {
      title: `${t('_lang:quantity')} / ${t('_page:Promo.redeemedQuantity')}`,
      dataIndex: 'quantity',
      width: 200,
      render: (text: string, record: Promo) => (
        <div className={style['redeemed-quantity']}>
          {record.quantity} / {record.redeemed_quantity}
        </div>
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
      render: (text: string, record: Promo) => (
        <TableColumnStatusSwitch
          id={record.id}
          value={Number(record.status)}
          size="small"
          variablesField="promo"
          mutation={UPDATE_PROMO}
          refetchQueries={[{ query: GET_PROMOS, variables: getPromosVariables }]}
        />
      ),
    },
    {
      title: t('_lang:action'),
      dataIndex: 'operation',
      width: 60,
      render: (text: string, record: Promo) => (
        <TableColumnDeleteButton
          id={record.id}
          fieldName={record.name}
          loading={deletePromoMutation.loading}
          onClick={async () => deletePromoMutate({ variables: { id: record.id } })}
        />
      ),
    },
  ];

  const onFilter = (params: { field: string; value?: string | number | number[] }) => {
    setTablePagination({ ...tablePagination, page: 1 });

    const filterParams: { q?: string; userId?: string } = {};

    if (params.field === 'q') {
      const result = params.value ? String(params.value) : undefined;

      setQ(result);
      filterParams.q = result;
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
          <SearchInput
            className={cx('g-extra-filter-bar--item', 'g-extra-filter-bar--q')}
            value={q}
            onChange={(v) => onFilter({ field: 'q', value: v })}
          />

          <ExportButton moduleName="promo" params={getPromosVariables} />
        </div>
      }
      className={style['wapper']}
      loading={getPromosQuery.loading}
    >
      <HtmlMeta title={t(`${props.route.namei18n}`)} />

      {getPromosQuery?.data?.promos?.items && (
        <TableCard selectedRowKeys={selectedRowKeys} totalLength={getPromosQuery.data.promos.total}>
          <Table
            rowKey="id"
            size="small"
            rowSelection={rowSelection}
            columns={columns as any}
            dataSource={getPromosQuery.data.promos.items}
            pagination={{
              defaultCurrent: tablePagination.page,
              defaultPageSize: tablePagination.pageSize,
              total: getPromosQuery.data.promos.total,
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
