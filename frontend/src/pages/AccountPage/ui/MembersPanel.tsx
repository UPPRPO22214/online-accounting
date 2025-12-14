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
import { useEffect, useState, type HTMLAttributes } from 'react';
import type React from 'react';

import {
  addAccountMember,
  getAccountMembers,
  getMyRole,
  removeAccountMember,
  membersLabels,
  type AccountMember,
  checkRole,
  membersChoosableLabels,
  editAccountMember,
} from '@/entities/AccountMember';
import { Button, ErrorMessage } from '@/shared/ui';
import { memberSchema, type MemberFormType } from '../types/memberFormTypes';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { MemberRole } from '@/entities/AccountMember/types';

type MembersPanelProps = HTMLAttributes<HTMLDivElement> & {
  accountId: number;
};

export const MembersPanel: React.FC<MembersPanelProps> = ({
  accountId,
  className,
  ...props
}) => {
  const [members, setMembers] = useState<AccountMember[]>([]);

  const [meMember, setMeMember] = useState<AccountMember>();
  useEffect(() => {
    setMeMember(getMyRole(accountId));
    setMembers(getAccountMembers(accountId));
  }, [accountId]);

  const [editingId, setEditingId] = useState<number>();

  const { register, formState, handleSubmit } = useForm<MemberFormType>({
    resolver: zodResolver(memberSchema),
  });

  if (!meMember) return <div>Loading...</div>;

  return (
    <div
      className={clsx(className, 'flex justify-start items-center gap-x-4')}
      {...props}
    >
      <span>Ваша роль - {membersLabels[meMember.role]}</span>
      {checkRole(meMember.role, 'admin') && (
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
              {members.map((member) => (
                <div
                  className="grid grid-cols-3 gap-x-2 border-1 not-first:border-t-0"
                  key={member.id}
                >
                  <div className="flex justify-start items-center p-1">
                    {member.nickname}
                  </div>
                  <div className="flex justify-center items-center gap-x-1 p-1">
                    {editingId === member.id ? (
                      <>
                        <Select
                          className="border-1"
                          defaultValue={member.role}
                          onChange={(e) => {
                            editAccountMember(accountId, {
                              ...member,
                              role: e.target.value as MemberRole,
                            });
                            setEditingId(undefined);
                            location.reload(); // Временно
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
                          <XMarkIcon className="size-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <span>{membersLabels[member.role]}</span>
                        {member.role !== 'owner' && (
                          <Button onClick={() => setEditingId(member.id)}>
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
                          removeAccountMember(accountId, member);
                          location.reload();
                        }}
                      >
                        {meMember.id === member.id
                          ? 'Самоудалиться'
                          : 'Удалить'}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <h2 className="mt-4 mb-1 text-center">Добавить участника</h2>
            <form
              className="grid grid-cols-3 items-center gap-x-2"
              onSubmit={handleSubmit((value) => {
                addAccountMember(accountId, value.email, value.role);
                location.reload();
              })}
            >
              <input
                className="p-1"
                type="email"
                placeholder="Электронная почта пользователя"
                {...register('email')}
              />
              <Select className="border-1" {...register('role')}>
                {Object.entries(membersChoosableLabels).map(([role, label]) => (
                  <option label={label} value={role} key={role}>
                    {role}
                  </option>
                ))}
              </Select>
              <Button>Добавить</Button>
              <ErrorMessage
                className="col-span-3 text-center"
                message={
                  formState.errors.root?.message ||
                  formState.errors.email?.message ||
                  formState.errors.role?.message
                }
              />
            </form>
          </PopoverPanel>
        </Popover>
      )}
    </div>
  );
};
