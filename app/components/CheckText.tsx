import React, { forwardRef, useImperativeHandle, useState } from 'react';

interface ICheckTextProps {}

type TCheckTextRef = {
  check: (value: string) => void;
};

function CheckText(props: ICheckTextProps, ref: React.Ref<TCheckTextRef>) {
  const [visible, setVisible] = useState(true);
  const [riskList, setRiskList] = useState([]);

  const checkText = async (value: string) => {
    const response = await fetch('/api/generate/check-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: value }),
    });

    const data = await response.json();
    if (response.ok && response.status === 200 && data.code === '0000') {
      if (data?.data?.status === 1 || !data?.data?.riskList?.length) {
        setRiskList([]);
        setVisible(false);
      } else {
        setRiskList(data.data.riskList);
        setVisible(true);
      }
    }
  };

  useImperativeHandle(ref, () => ({
    check(value: string) {
      if (value) {
        checkText(value);
      }
    },
  }));

  if (!visible) {
    return <></>;
  }

  return (
    <div className='mt-6 border-t border-gray-100'>
      <dl className='divide-y divide-gray-100'>
        {riskList?.map?.((item: any) => (
          <div className='px-4 py-2 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-0'>
            <dt className='text-sm/6 font-medium text-gray-900'>
              <span
                className={
                  item?.type === '禁用词'
                    ? 'text-red-500 border-solid border border-red-300 rounded-sm mr-1 text-xs/3 p-1'
                    : 'text-orange-500 border-solid border border-orange-300 rounded-sm mr-1 text-xs/3 p-1'
                }
              >
                {item?.type}
              </span>
              {item?.title}
            </dt>
            <dd className='mt-1 text-sm/6 text-gray-700 sm:col-span-1 sm:mt-0'>
              所属：{item?.sourse}
            </dd>
            <dd className='mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0'>
              解释：{item?.reason}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default forwardRef(CheckText);
