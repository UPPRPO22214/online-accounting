import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Select,
} from '@headlessui/react';
import {
  ChevronDownIcon,
  PencilSquareIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid';
import clsx from 'clsx';
import { useState, type HTMLAttributes } from 'react';
import type React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
  membersLabels,
  checkRole,
  membersChoosableLabels,
  useAccountMembers,
  useAccountMemberUpdate,
  useAccountMemberDelete,
  useAccountMemberCreate,
} from '@/entities/AccountMember';
import { Button, ErrorMessage, Loader } from '@/shared/ui';
import { memberSchema, type MemberFormType } from '../types/memberFormTypes';
import type { MemberRole } from '@/entities/AccountMember/types';
import type { HandlersChangeRoleRequest } from '@/shared/api';
import { useMeMember } from '@/entities/AccountMember/api/useMeMember';

type MembersPanelProps = HTMLAttributes<HTMLDivElement> & {
  accountId: number;
};

export const MembersPanel: React.FC<MembersPanelProps> = ({
  accountId,
  className,
  ...props
}) => {
  const {
    members,
    isLoading: membersLoading,
    error: membersError,
  } = useAccountMembers(accountId);
  const {
    meMember,
    isLoading: memberLoading,
    error: memberError,
  } = useMeMember(accountId);

  const [editingId, setEditingId] = useState<number>();

  const { register, formState, handleSubmit } = useForm<MemberFormType>({
    resolver: zodResolver(memberSchema),
  });

  const {
    createAccountMember,
    isPending: createAccountMemberPending,
    error: createAccountMemberError,
  } = useAccountMemberCreate(accountId);
  const {
    updateAccountMember,
    isPending: updateAccountMemberPending,
    error: updateAccountMemberError,
  } = useAccountMemberUpdate(accountId, () => {
    setEditingId(undefined);
  });
  const {
    deleteAccountMember,
    isPending: deleteAccountMemberPending,
    error: deleteAccountMemberError,
  } = useAccountMemberDelete(accountId);

  return (
    <div
      className={clsx(className, 'flex justify-start items-center gap-x-4')}
      {...props}
    >
      <Loader isLoading={membersLoading || memberLoading} />
      <ErrorMessage message={membersError?.message || memberError} />
      {meMember && (
        <>
          <span>Ваша роль - {membersLabels[meMember.role as MemberRole]}</span>
          {checkRole(meMember.role as MemberRole, 'owner') && (
            <Popover>
              <PopoverButton
                as={Button}
                className="flex justify-start items-center gap-x-2 group data-open:border-1 cursor-pointer"
              >
                <span>Управление ролями</span>
                <ChevronDownIcon className="transition-base w-5 data-openend::rotate-180 group-data-open:rotate-180" />
              </PopoverButton>
              <PopoverPanel
                className={clsx(
                  'w-1/2 p-2 m-1 bg-white border-2',
                  'transition-base ease-out data-closed:-translate-y-6 data-closed:opacity-0',
                )}
                transition
                anchor="bottom"
              >
                <h2 className="mb-2 text-center">Участники</h2>
                <div className="">
                  {members?.map((member) => (
                    <div
                      className="grid grid-cols-3 gap-x-2 border-1 not-first:border-t-0"
                      key={member.user_id}
                    >
                      <div className="flex justify-start items-center p-1">
                        {member.user_id}{' '}
                        {/** TODO: надо хотя бы почту писать */}
                      </div>
                      <div className="flex justify-center items-center gap-x-1 p-1">
                        {editingId === member.user_id ? (
                          <>
                            <Select
                              className="border-1"
                              defaultValue={member.role}
                              onChange={(e) => {
                                updateAccountMember({
                                  userId: member.user_id!,
                                  role: e.target
                                    .value as HandlersChangeRoleRequest['role'],
                                });
                              }}
                            >
                              {Object.entries(membersChoosableLabels).map(
                                ([role, label]) => (
                                  <option label={label} value={role} key={role}>
                                    {role}
                                  </option>
                                ),
                              )}
                            </Select>
                            <Button onClick={() => setEditingId(undefined)}>
                              {updateAccountMemberPending ? (
                                <Loader />
                              ) : (
                                <XMarkIcon className="size-4" />
                              )}
                            </Button>
                          </>
                        ) : (
                          <>
                            <span>
                              {membersLabels[member.role as MemberRole]}
                            </span>
                            {member.role !== 'owner' && (
                              <Button
                                onClick={() => setEditingId(member.user_id)}
                              >
                                <PencilSquareIcon className="size-4" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                      <div className="flex justify-end items-center p-1">
                        {member.role !== 'owner' && (
                          <Button
                            onClick={() => {
                              deleteAccountMember({ userId: member.user_id! });
                            }}
                          >
                            {deleteAccountMemberPending ? (
                              <Loader />
                            ) : (
                              'Удалить'
                            )}
                          </Button>
                        )}
                      </div>
                      <ErrorMessage
                        className="col-span-3 flex justify-center"
                        message={
                          updateAccountMemberError?.message ||
                          deleteAccountMemberError?.message
                        }
                      />
                    </div>
                  ))}
                </div>
                <h2 className="mt-4 mb-1 text-center">Добавить участника</h2>
                <form
                  className="grid grid-cols-3 items-center gap-x-2"
                  onSubmit={handleSubmit((value) => {
                    createAccountMember({ ...value });
                  })}
                >
                  <input
                    className="p-1"
                    type="email"
                    placeholder="Электронная почта пользователя"
                    {...register('email')}
                  />
                  <Select className="border-1" {...register('role')}>
                    {Object.entries(membersChoosableLabels).map(
                      ([role, label]) => (
                        <option label={label} value={role} key={role}>
                          {role}
                        </option>
                      ),
                    )}
                  </Select>
                  <Button>
                    {createAccountMemberPending ? <Loader /> : 'Добавить'}
                  </Button>
                  <ErrorMessage
                    className="col-span-3 text-center"
                    message={
                      formState.errors.root?.message ||
                      formState.errors.email?.message ||
                      formState.errors.role?.message ||
                      createAccountMemberError?.message
                    }
                  />
                </form>
              </PopoverPanel>
            </Popover>
          )}
        </>
      )}
    </div>
  );
};
