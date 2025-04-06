import EmployeeTable from "./components/EmployeeTable/EmployeeTable"

const App = () => {
  return (
    <div className='flex items-center justify-center flex-col p-10'>
      <h1 className="text-2xl font-bold underline">Keyhook Test Project</h1>
      <EmployeeTable />
    </div>
  )
}

export default App
