import React from 'react'

export const CaseDetail = ({caseItem}) => {
  console.log(caseItem)
  const data = [
    {
    text: 'Title',
    vlaue:caseItem?.title 
  },
    {
    text: 'Description',
    vlaue:caseItem?.description
  },
    {
    text: 'Created at',
    vlaue:caseItem?.created_at 
  },
    {
    text: 'Updated at',
    vlaue:caseItem?.updated_at
  },
]
  return (
    <div className='flex flex-col gap-5'>
      <h3 className='text-xl text-primary-purple font-semibold'>Case Detail</h3>
      <div className='flex flex-col gap-3'>
        {
          data?.map((item,idx)=>(
            <div key={idx} className='grid grid-cols-[40%_1fr] items-center '>
              <p className='font-bold'>{item.text}</p>
              <p className='text-primary-purple'>{item.vlaue}</p>
            </div>
          ))
        }
        </div>
    </div>
  )
}
