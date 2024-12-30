import React from 'react'

export default function Th({ styleTh, children ,onClick}) {



    return (
        <th onClick={onClick} className={`${styleTh} py-2 pl-2 text-sm font-medium capitalize`}>
            {children}
        </th>
    )
}
