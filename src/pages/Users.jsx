import React from 'react'
import Sidebar from '../components/Sidebar'
import FileuploadContent from '../components/Fileupload/Content/UsersContent'
function Users() {
  return (
    <div className="container-fluid m-0 p-0 d-flex">
        <Sidebar/>
        <main><FileuploadContent/></main>
    </div>
  )
}

export default Users