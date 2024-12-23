import React from 'react'

export default function LinkSubMenu({href,children,isActive}) {

    // console.log('este es el children ->',children,'este es el link',isActive)
  return (
    <a href={href} className={`${isActive?'bg-primary-300/50':''} leading-3 text-center text-xs font-thin capitalize rounded-lg px-2 py-1 border border-primary-200/50 hover:border-primary-100 duration-200 hover:bg-primary-200/10`}>{children}</a>
  )
}
