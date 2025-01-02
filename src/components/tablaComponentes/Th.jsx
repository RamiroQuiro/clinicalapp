import React from 'react'

export default function Th({ styleTh, children ,onClick}) {



    return (
        <th onClick={onClick} className={`${styleTh} py-2 text-left last:text-end last:pr-4 first:pl-4  text-sm font-medium capitalize`}>
            {children}
        </th>
    )
}
