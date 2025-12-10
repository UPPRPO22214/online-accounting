import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { ChevronDownIcon, PencilSquareIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';
import { useEffect, useState, type HTMLAttributes } from 'react';
import type React from 'react';

import { getAccountMembers } from '@/entities/Account/api';
import { membersLabels, type AccountMember } from '@/entities/Account/types';
import { Button, ErrorMessage } from '@/shared/ui';

type MembersPanelProps = HTMLAttributes<HTMLDivElement> & {
  accountId: string;
};

export const MembersPanel: React.FC<MembersPanelProps> = ({
  accountId,
  className,
  ...props
}) => {
  const [members, setMembers] = useState<AccountMember[]>([]);

  useEffect(() => {
    setMembers(getAccountMembers(accountId));
  }, [accountId]);

  return (
    <div
      className={clsx(className, 'flex justify-start items-center gap-x-4')}
      {...props}
    >
      <span>Ваша роль - РОЛЬ</span>
      {/* TODO: Только owner и admin */}
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
          {members.map((member) => (
            <div className="grid grid-cols-3 gap-x-2 border-1" key={member.id}>
              <div className="flex justify-start items-center p-1">
                {member.nickname}
              </div>
              <div className="flex justify-center items-center gap-x-1 p-1">
                <span>{membersLabels[member.role]}</span>
                <Button>
                  <PencilSquareIcon className="size-4" />
                </Button>
              </div>
              <div className="flex justify-end items-center p-1">
                <Button>Удалить</Button>{' '}
                {/* TODO: если владелец, то кнопки не будет, если админ, то будет "самоудалиться" */}
              </div>
            </div>
          ))}
          <h2 className="mt-4 mb-1 text-center">Добавить участника</h2>
          <form className="grid grid-cols-3 items-center gap-x-2">
            <div className="">
              <input
                type="email"
                placeholder="Электронная почта пользователя"
              />
            </div>
            <div className="flex justify-around">
              <span>РОЛЬ</span>
            </div>
            <Button>Добавить</Button>

            <ErrorMessage className="col-span-3 text-center" message="Ошибки" />
          </form>
        </PopoverPanel>
      </Popover>
    </div>
  );
};
