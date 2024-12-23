import React from 'react'

export default function Th({ styleTh, children ,onClick}) {



    return (
        <th onClick={onClick} className={`${styleTh} align-middle border border-solid py-3 text-xs uppercase  border-l-0 border-r-0 whitespace-nowrap font-semibold text-center`}>
            {children}
        </th>
    )
}
