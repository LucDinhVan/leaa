import cx from 'classnames';
import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Col, Form, Row, Checkbox } from 'antd';
import { CheckboxValueType } from 'antd/es/checkbox/Group';
import { CheckboxChangeEvent } from 'antd/es/checkbox';

import { useTranslation } from 'react-i18next';

import { User, Role } from '@leaa/api/src/entrys';
import { errorMsg } from '@leaa/dashboard/src/utils';
import { IOnValidateFormResult } from '@leaa/dashboard/src/interfaces';
import { UserUpdateOneReq } from '@leaa/api/src/dtos/user';

import { FormCard } from '@leaa/dashboard/src/components';

import style from './style.module.less';

interface IProps {
  className?: string;
  item?: User;
  roles: Role[];
  loading?: boolean;
}

export const UserRolesForm = forwardRef((props: IProps, ref: React.Ref<any>) => {
  const { t } = useTranslation();
  const rolesLength = Array.isArray(props.roles) ? props.roles.length : 0;

  const [form] = Form.useForm();

  const getRoleIds = (roles: Role[] | undefined): string[] => roles?.map((r) => r.id) || [];

  const [roleIds, setRoleIds] = useState<CheckboxValueType[]>(getRoleIds(props.item?.roles));

  const onValidateForm = async (): IOnValidateFormResult<UserUpdateOneReq> => {
    try {
      return await form.validateFields();
    } catch (err) {
      return errorMsg(err.errorFields[0]?.errors[0]);
    }
  };

  const onCheckedAll = (event: CheckboxChangeEvent): void => {
    const ids = event.target.checked ? props.roles.map((r) => r.id) : [];

    setRoleIds(ids);
    form.setFieldsValue({ roleIds: ids });
  };

  const onChange = (value: CheckboxValueType[]): void => {
    const ids = value.map((v) => v);

    setRoleIds(ids);
    form.setFieldsValue({ roleIds: ids });
  };

  const onUpdateForm = (item?: User): void => {
    if (!item) return undefined;

    // if APIs return error, do not flush out edited data
    if (form.getFieldValue('updated_at') && !item.updated_at) {
      form.resetFields();
      return undefined;
    }

    // update was successful, keeping the form data and APIs in sync.
    if (form.getFieldValue('updated_at') !== item.updated_at) {
      form.resetFields();
      form.setFieldsValue({
        ...item,
        roleIds: getRoleIds(props.item?.roles),
      });
    }

    return undefined;
  };

  const onClacIndeterminate = () => rolesLength > 0 && roleIds.length > 0 && roleIds.length < rolesLength;
  const onClacChecked = () => rolesLength > 0 && roleIds.length === rolesLength;

  useEffect(() => {
    if (props.item?.roles) setRoleIds(props.item?.roles?.map((r) => r.id));
  }, [props.item]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => onUpdateForm(props.item), [form, props.item]);
  useImperativeHandle(ref, () => ({ form, onValidateForm }));

  return (
    <div className={cx(style['user-roles-form-wrapper'], props.className)}>
      <FormCard title={t('_page:User.userRoles')}>
        <Checkbox
          indeterminate={onClacIndeterminate()}
          checked={onClacChecked()}
          onChange={onCheckedAll}
          className={style['check-all']}
          value={roleIds}
        >
          {t('_lang:checkAll')}
        </Checkbox>

        <Form form={form} name="user-roles" layout="vertical">
          <Form.Item name="roleIds" rules={[]} className={style['check-role']}>
            <Checkbox.Group onChange={onChange}>
              <Row gutter={16}>
                {props.roles.map((r) => (
                  <Col key={r.id}>
                    <Checkbox value={r.id}>{r.name}</Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </Form.Item>
        </Form>
      </FormCard>
    </div>
  );
});
